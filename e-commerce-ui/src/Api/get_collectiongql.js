import { gql } from "@apollo/client";

export const buildCollectionsQuery = (fields = [
    "id",
    "name",
    "createdAt",
    "languageCode",
    "updatedAt",
    "slug",
    "position",
    "description"
]) => {
    return gql`
    query {
      collections {
        items {
          ${fields.join("\n          ")}
        }
      }
    }
  `;
};
