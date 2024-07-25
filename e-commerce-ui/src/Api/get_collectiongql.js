import { gql } from "@apollo/client";

// // Helper function to build nested fields
// const buildFields = (fields, indentLevel = 0) => {
//   const indent = ' '.repeat(indentLevel * 2);
//   return fields
//     .map(field => {
//       if (typeof field === 'string') {
//         return `${indent}${field}`;
//       } else {
//         const [fieldName, nestedFields] = Object.entries(field)[0];
//         return `${indent}${fieldName} {\n${buildFields(nestedFields, indentLevel + 1)}\n${indent}}`;
//       }
//     })
//     .join('\n');
// };

// export const buildCollectionsQuery = (fields = [
//   "id",
//   "name",
//   "createdAt",
//   "languageCode",
//   "updatedAt",
//   "slug",
//   "position",
//   "description",
//   {
//     breadcrumbs: ["id", "name", "slug"]
//   },
//   {
//     featuredAsset: [
//       "id",
//       "createdAt",
//       "updatedAt",
//       "name",
//       "type",
//       "fileSize",
//       "mimeType",
//       "width",
//       "height",
//       "source",
//       "preview",
//       {
//         focalPoint: ["x", "y"]
//       },
//       {
//         tags: ["id"]
//       },
//       "customFields"
//     ]
//   },
//   {
//     assets: [
//       "id",
//       "createdAt",
//       "updatedAt",
//       "name",
//       "type",
//       "fileSize",
//       "mimeType",
//       "width",
//       "height",
//       "source",
//       "preview",
//       {
//         focalPoint: ["x", "y"]
//       },
//       {
//         tags: ["id"]
//       },
//       "customFields"
//     ]
//   },
//   {
//     parent: ["id", "name", "slug"]
//   },
//   "parentId",
//   {
//     children: ["id", "name", "slug"]
//   },
//   {
//     filters: [
//       "code",
//       {
//         args: ["name", "value"]
//       }
//     ]
//   },
//   {
//     translations: ["id", "languageCode", "name", "description", "slug"]
//   },
//   {
//     productVariants: [
//       "totalItems",
//       {
//         items: ["id", "name", "price", "sku"]
//       }
//     ]
//   },
//   "customFields"
// ]) => {
//   return gql`
//     query GetCollectionListWithAssets($options: CollectionListOptions) {
//       collections(options: $options) {
//         items {
//           ${buildFields(fields, 3)}
//         }
//         totalItems
//       }
//     }
//   `;
// };

// export const buildCollectionsQueryList = (fields = [
//   "id",
//   "name",
//   "createdAt",
//   "languageCode",
//   "updatedAt",
//   "slug",
//   "position",
//   "description",
//   {
//     breadcrumbs: ["id", "name", "slug"]
//   },
//   {
//     featuredAsset: [
//       "id",
//       "createdAt",
//       "updatedAt",
//       "name",
//       "type",
//       "fileSize",
//       "mimeType",
//       "width",
//       "height",
//       "source",
//       "preview",
//       {
//         focalPoint: ["x", "y"]
//       },
//       {
//         tags: ["id"]
//       },
//       "customFields"
//     ]
//   },
//   {
//     assets: [
//       "id",
//       "createdAt",
//       "updatedAt",
//       "name",
//       "type",
//       "fileSize",
//       "mimeType",
//       "width",
//       "height",
//       "source",
//       "preview",
//       {
//         focalPoint: ["x", "y"]
//       },
//       {
//         tags: ["id"]
//       },
//       "customFields"
//     ]
//   },
//   {
//     parent: ["id", "name", "slug"]
//   },
//   "parentId",
//   {
//     children: ["id", "name", "slug"]
//   },
//   {
//     filters: [
//       "code",
//       {
//         args: ["name", "value"]
//       }
//     ]
//   },
//   {
//     translations: ["id", "languageCode", "name", "description", "slug"]
//   },
//   {
//     productVariants: [
//       "totalItems",
//       {
//         items: ["id", "name", "price", "sku"]
//       }
//     ]
//   },
//   "customFields"
// ]) => {
//   return gql`
//     query GetCollectionListWithAssets($options: CollectionListOptions) {
//       collections(id:$id) {
//         items {
//           ${buildFields(fields, 3)}
//         }
//         totalItems
//       }
//     }
//   `;
// };
export const GETCATEGORY = gql`
  query GetCategory{
    collections {
      items {
        id
        name
        createdAt
        languageCode
        updatedAt
        slug
        position
        description
        productVariants {
          items {
            id
            name
            price
          }
            totalItems
        }
          featuredAsset{
        preview
      }
      }
    }
  }
`;

export const GET_ALL_PRODUCTS = (slug) => gql`
  query collection {
    collection(slug: "${slug}") {
      children {
        id
        name
        slug
        createdAt
        __typename
        featuredAsset {
          id
          createdAt
          name
          preview
        }
      }
      name
      productVariants {
        items {
          name
          productId
          price
          product {
            id
            name
            slug
            featuredAsset {
              id
              preview
            }
          }
        }
        totalItems
      }
    }
    activeOrder {
      totalQuantity
    }
  }
`;

export const GET_COLLECTION = (slug) => gql`
query collection{
  collection(slug: "${slug}"){
    id

FilteredProduct{
  items{
    slug
    id
    name
    description
    assets{
      id
      source
      preview
    }
    variants{
      id
      createdAt
    }
  }
  totalItems
}
productVariants(options:{
  filter:{
    productId:{
      eq:""
    }
  }
}){
  items{
    productId
  }
  totalItems
}
  }
}
`

export const GET_PRODUCT_DETAILS = (slug, productId) => gql`
query product{
  collection(slug:"${slug}"){
    id

FilteredProduct(options:{
  filter:{id:
    {
      eq:"${productId}"
    }
    
  }
}){
  items{
    id
    name
    description
    assets{
      id
      source
      preview
    }
  }
  totalItems
}
productVariants(options:{
  filter:{
    productId:{
      eq:"${productId}"
    }
  }
}){
  items{
  id
  price
    productId
    name
    stockLevel
  }
  totalItems
}
  }
}
`;