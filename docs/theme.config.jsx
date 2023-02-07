export default {
  logo: <b>Mongur</b>,
  project: {
    link: 'https://github.com/sha256/Mongur',
  },
  docsRepositoryBase: 'https://github.com/sha256/Mongur',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Mongur'
    }
  },
  head: (
    <>
      <meta property="og:title" content="Mongur - Typscript ODM for MongoDB" />
      <meta property="og:description" content="Define MongoDB models and query data using Typescript/Javascript classes." />
    </>
  ),
  footer: {
    text: <span></span>,
  }
}