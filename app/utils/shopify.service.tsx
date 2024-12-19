import Shopify from 'shopify-api-node';


const shopify = new Shopify({
    shopName: process.env.SHOPIFY_APP_URL!,
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
});

const fetchProd = async (
    cursor: string | null = null,
    pageSize: number = 5,
    direction: "next" | "previous" = "next"
): Promise<{ products: object[]; hasNext: boolean; hasPrevious: boolean; nextCursor: string | null; previousCursor: string | null }> => {


    const query = `
  {
    products(${direction === "next" ? `first: ${pageSize}${cursor ? `, after: "${cursor}"` : ''}` : `last: ${pageSize}${cursor ? `, before: "${cursor}"` : ''}`}) {
      edges {
        node {
          id
          title
          status
          variants(first: 1) {
            edges {
              node {
                id
                price
                sku
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  `;

    try {
        const response = await shopify.graphql(query);

        const parseProductID = (inputString) => {
            const parts = inputString.split('/'); // Split the string by '/'
            return parts[parts.length - 1]; // Return the last part
        }



        const products = response.products.edges.map((product) => {
            const data = product.node;
            return {
                id: parseProductID(data.id), // Product global ID
                title: data.title,
                status: data.status,
                variantId: data.variants.edges[0]?.node.id,
                variantPrice: data.variants.edges[0]?.node.price,
                variantSku: data.variants.edges[0]?.node.sku
            };
        });


        const hasNext = response.products.pageInfo.hasNextPage;
        const hasPrevious = response.products.pageInfo.hasPreviousPage;
        const nextCursor = response.products.pageInfo.endCursor || null;
        const previousCursor = response.products.pageInfo.startCursor || null;

        return { products, hasNext, hasPrevious, nextCursor, previousCursor };
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return { products: [], hasNext: false, hasPrevious: false, nextCursor: null, previousCursor: null };
    }
};

const createProduct = (
    title: string,
    variantPrice: number,
    variantSku: string,

): Promise<Shopify.IProduct> => {

    const data = {
        title: title,
        variants: [
            {
                price: variantPrice,
                sku: variantSku,
                }]
    };

    return  shopify.product.create(data);
};


const getProductById = (
    id:number
): Promise<Shopify.IProduct> => {
    return shopify.product.get(id);
};

const updateProductAndVariantById = (
    productId:number, productParams: object, variantId:number, variantParams:object
):  Promise<Shopify.IProduct> => {
    return  shopify.productVariant.update(variantId, variantParams).then(()=>shopify.product.update(productId, productParams));
};


export  {fetchProd, createProduct,getProductById, updateProductAndVariantById};


