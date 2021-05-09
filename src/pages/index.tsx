import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiUser, FiCalendar } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { results, next_page } = postsPagination;

  return (
    <>
      <Head>
        <title>Home | Blog</title>
      </Head>
      <main className={styles.contentContainer}>
        <div className={styles.posts}>
          <img src="/images/logo.svg" alt="logo" />

          {results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <span>
                    <FiCalendar />
                    {post.first_publication_date}
                  </span>
                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}

          {next_page && <button type="button">Carregar mais posts</button>}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts-blog')],
    {
      fetch: ['publication.títle', 'publication.subtítle'],
      pageSize: 5,
    }
  );

  // console.log(JSON.stringify(postsResponse, null, 2));

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy'
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
