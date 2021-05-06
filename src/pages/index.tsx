/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiUser, FiCalendar } from 'react-icons/fi';
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

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | Blog</title>
      </Head>
      <main className={styles.contentContainer}>
        <div className={styles.posts}>
          <img src="/images/logo.svg" alt="logo" />
          <a href="/">
            <h1>Como utilizar Hooks</h1>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div>
              <span>
                <FiCalendar />
                15 Mar 2021
              </span>
              <span>
                <FiUser />
                Joseph Oliveira
              </span>
            </div>
          </a>

          <a href="/">
            <h1>Criando um app CRA do zero</h1>
            <p>
              Tudo sobre como criar a sua primeira aplicação utilizando Create
              React App
            </p>
            <div>
              <span>
                <FiCalendar />
                19 Abr 2021
              </span>
              <span>
                <FiUser />
                Danilo Vieira
              </span>
            </div>
          </a>

          <a href="/">
            <h1>Como utilizar Hooks</h1>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div>
              <span>
                <FiCalendar />
                15 Mar 2021
              </span>
              <span>
                <FiUser />
                Joseph Oliveira
              </span>
            </div>
          </a>

          <a href="/">
            <h1>Criando um app CRA do zero</h1>
            <p>
              Tudo sobre como criar a sua primeira aplicação utilizando Create
              React App
            </p>
            <div>
              <span>
                <FiCalendar />
                19 Abr 2021
              </span>
              <span>
                <FiUser />
                Danilo Vieira
              </span>
            </div>
          </a>

          <button type="button">Carregar mais posts</button>
        </div>
      </main>
    </>
  );
}

// export const getStaticProps: GetStaticProps = async () => {
//   const prismic = getPrismicClient();
//   const postsResponse = await prismic.query();

//   if (!postsResponse) {
//     return {
//       notFound: true,
//     }
//   }

//   return {
//     props: {

//     }
//   }
// };
