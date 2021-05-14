import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
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
                {post.first_publication_date}
              </span>

              <span>
                <FiUser />
                {post.data.author}
              </span>

              <span>
                <FiClock />4 min
              </span>
            </div>
            {post.data.content.map(({ heading, body }) => (
              <div className={styles.text}>
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
  // const prismic = getPrismicClient();
  // const posts = await prismic.query([
  //   Prismic.predicates.at('document.type', 'posts'),
  // ]);

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const response = await prismic.getByUID('posts-blog', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy'
    ),
    data: {
      title: response.data.title,
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
