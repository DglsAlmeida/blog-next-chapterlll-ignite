/* eslint-disable react/no-array-index-key */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
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
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <p>Carregando...</p>;
  }

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
                <FiClock />4 min
              </span>
            </div>
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
          </article>
        </div>
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

  const post = {
    uid: response.uid,
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
    },
  };
};
