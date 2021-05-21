/* eslint-disable react/no-array-index-key */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { useEffect } from 'react';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  prevPost: ApiSearchResponse;
  nextPost: ApiSearchResponse;
}

export default function Post({ post, prevPost, nextPost }: PostProps) {
  const { isFallback } = useRouter();

  useEffect(() => {
    const scriptElem = document.createElement('script');
    const elem = document.getElementById('inject-comments-for-uterances');
    scriptElem.src = 'https://utteranc.es/client.js';
    scriptElem.async = true;
    scriptElem.crossOrigin = 'anonymous';
    scriptElem.setAttribute('repo', 'DglsAlmeida/blog-next-chapterlll-ignite');
    scriptElem.setAttribute('issue-term', 'pathname');
    scriptElem.setAttribute('label', 'blog-comment');
    scriptElem.setAttribute('theme', 'github-dark');
    elem.appendChild(scriptElem);
  }, []);

  if (isFallback) {
    return <p>Carregando...</p>;
  }

  const timeToRead = Math.ceil(
    RichText.asText(
      post.data.content.reduce(
        (acc, currentValue) => [...acc, ...currentValue.body],
        []
      )
    ).split(' ').length / 200
  );

  const edited = format(
    parseISO(post.first_publication_date),
    "'* editado em' dd MMM yyyy', às' HH:mm ",
    {
      locale: ptBR,
    }
  );

  return (
    <>
      <Head>
        <title>Home | Blog</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <img src={`${post.data.banner.url}`} alt="imagem" />

        <div className={styles.mainContent}>
          <article>
            <h1>{post.data.title}</h1>
            <div className={styles.datasAboutText}>
              <span>
                <FiCalendar />
                {format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </span>

              <span>
                <FiUser />
                {post.data.author}
              </span>

              <span>
                <FiClock />
                {timeToRead} min
              </span>
            </div>

            <span className={styles.editContent}>{edited}</span>

            {post.data.content.map(({ heading, body }, key) => (
              <div key={`${post.uid}.${key}`} className={styles.text}>
                <h2>{heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(body),
                  }}
                />
              </div>
            ))}
            <div className={styles.prevAndNext}>
              {prevPost &&
                prevPost.results.map(prevPostItem => (
                  <Link href={`/post/${prevPostItem.uid}`}>
                    <a>
                      <h3>{prevPostItem?.data.title}</h3>
                      <span>Post anterior</span>
                    </a>
                  </Link>
                ))}

              {nextPost &&
                nextPost.results.map(nextPostItem => (
                  <Link href={`/post/${nextPostItem.uid}`}>
                    <a>
                      <h3>{nextPostItem?.data.title}</h3>
                      <span>Proximo Post</span>
                    </a>
                  </Link>
                ))}
            </div>
          </article>
        </div>
        <div id="inject-comments-for-uterances" />
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts-blog')],
    { pageSize: 1 }
  );

  const postsUid = posts.results.map(post => {
    return {
      params: {
        slug: String(post.uid),
      },
    };
  });

  return {
    paths: postsUid,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const response = await prismic.getByUID('posts-blog', String(slug), {});

  const prevPost = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts-blog'),
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const nextPost = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts-blog'),
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
    }
  );

  const post = {
    uid: response.uid,
    last_publication_date: response.last_publication_date,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  if (!response) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
      nextPost,
      prevPost,
    },
  };
};
