import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiUser, FiCalendar } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';
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
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function loadingMorePages() {
    fetch(nextPage)
      .then(res => res.json())
      .then(res => {
        const newPosts = res.results.map(newPost => {
          return {
            uid: newPost.uid,
            first_publication_date: format(
              new Date(newPost.first_publication_date),
              'dd MMM yyyy'
            ),
            data: {
              author: newPost.data.author,
              title: newPost.data.title,
              subtitle: newPost.data.subtitle,
            },
          };
        });
        setPosts(oldpost => [...oldpost, ...newPosts]);
        setNextPage(res.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | Blog</title>
      </Head>
      <main className={styles.contentContainer}>
        <div className={styles.posts}>
          <img src="/images/logo.svg" alt="logo" />

          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <span>
                    <FiCalendar />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </span>
                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}

          {nextPage && (
            <button onClick={loadingMorePages} type="button">
              Carregar mais posts
            </button>
          )}
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
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
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
    revalidate: 60 * 30,
  };
};
