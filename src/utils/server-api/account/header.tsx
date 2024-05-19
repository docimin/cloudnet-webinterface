export async function getSearchData(lang: string) {
  const apiUrlProducts = `${process.env.NEXT_PUBLIC_API_URL}/v1/databases/db_web/collections/products/documents?queries[]={"method":"contains","attribute":"multiStores","values":["${process.env.NEXT_PUBLIC_STORE_ID}"]}&queries[]={"method":"equal","attribute":"lang","values":["${lang}"]}`
  const apiUrlCategories = `${process.env.NEXT_PUBLIC_API_URL}/v1/databases/db_web/collections/categories/documents?queries[]={"method":"contains","attribute":"multiStores","values":["${process.env.NEXT_PUBLIC_STORE_ID}"]}&queries[]={"method":"equal","attribute":"lang","values":["${lang}"]}`
  const apiUrlPages = `${process.env.NEXT_PUBLIC_API_URL}/v1/databases/db_web/collections/pages/documents?queries[]={"method":"contains","attribute":"multiStores","values":["${process.env.NEXT_PUBLIC_STORE_ID}"]}&queries[]={"method":"equal","attribute":"lang","values":["${lang}"]}`

  const [products, categories, pages] = await Promise.all([
    fetch(apiUrlProducts, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APPWRITE_DATABASES_PROJECT_ID}`,
        'X-Appwrite-Response-Format': '1.5.0',
      },
    }).then((response) => response.json()),
    fetch(apiUrlCategories, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APPWRITE_DATABASES_PROJECT_ID}`,
        'X-Appwrite-Response-Format': '1.5.0',
      },
    }).then((response) => response.json()),
    fetch(apiUrlPages, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APPWRITE_DATABASES_PROJECT_ID}`,
        'X-Appwrite-Response-Format': '1.5.0',
      },
    }).then((response) => response.json()),
  ])

  return {
    products: products.documents,
    categories: categories.documents,
    pages: pages.documents,
  }
}
