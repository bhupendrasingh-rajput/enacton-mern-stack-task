//@ts-nocheck
"use server";

import { sql } from "kysely";
import { DEFAULT_PAGE_SIZE } from "../../constant";
import { db } from "../../db";
import { InsertProducts, UpdateProducts } from "@/types";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/utils/authOptions";
import { cache } from "react";
import { toast } from "react-toastify";

export async function getProducts(pageNo, pageSize, sortBy, brandId, categoryId, range, gender, occasions, discount) {
  try {
    pageNo = Math.max(pageNo, 1);

    let dbQuery = db.selectFrom("products").selectAll();
    let countQuery = db.selectFrom("products").select(db.fn.count('id').as("count"));

    if (sortBy) {
      const [column, order] = sortBy.split('-');
      if (['asc', 'desc'].includes(order)) {
        dbQuery = dbQuery.orderBy(column, order);
      }
    }

    if (brandId) {
      const brandIds = brandId.split(',').map(id => id.trim());
      dbQuery = dbQuery.where((eb) =>
        eb.or(
          brandIds.map(id =>
            eb('brands', 'like', `%,${id},%`)
              .or('brands', 'like', `${id},%`)
              .or('brands', 'like', `%,${id}`)
          )
        )
      );
      countQuery = countQuery.where((eb) =>
        eb.or(
          brandIds.map(id =>
            eb('brands', 'like', `%,${id},%`)
              .or('brands', 'like', `${id},%`)
              .or('brands', 'like', `%,${id}`)
          )
        )
      );
    }

    if (categoryId) {
      const categoryIds = categoryId.split(',').map(id => id.trim());
      const productIdsResult = await db
        .selectFrom('product_categories')
        .select('product_id')
        .where('category_id', 'in', categoryIds)
        .execute();

      const productIds = productIdsResult.map(row => row.product_id);
      if (productIds.length === 0) {
        return { products: [], count: 0, lastPage: 1, numOfResultsOnCurPage: 0 };
      }

      dbQuery = dbQuery.where('id', 'in', productIds);
      countQuery = countQuery.where('id', 'in', productIds);
    }

    if (range) {
      dbQuery = dbQuery.where('price', '<=', parseFloat(range));
      countQuery = countQuery.where('price', '<=', parseFloat(range));
    }

    if (gender) {
      dbQuery = dbQuery.where('gender', 'like', gender);
      countQuery = countQuery.where('gender', 'like', gender);
    }

    if (occasions) {
      const occasionsArr = occasions.split(',').map(id => id.trim());
      dbQuery = dbQuery.where((eb) => {
        const orCondition = occasionsArr.map(occasion =>
          eb.or([
            eb('occasion', 'like', `%,${occasion},%`),
            eb('occasion', 'like', `${occasion},%`),
            eb('occasion', 'like', `%,${occasion}`),
            eb('occasion', 'like', `${occasion}`)
          ])
        );
        return eb.or(orCondition);
      });
      countQuery = countQuery.where((eb) => {
        const orCondition = occasionsArr.map(occasion =>
          eb.or([
            eb('occasion', 'like', `%,${occasion},%`),
            eb('occasion', 'like', `${occasion},%`),
            eb('occasion', 'like', `%,${occasion}`),
            eb('occasion', 'like', `${occasion}`)
          ])
        );
        return eb.or(orCondition);
      });
    }

    if (discount) {
      const [discountFrom, discountTo] = discount.split('-').map(d => parseInt(d, 10));
      dbQuery = dbQuery.where('discount', '>=', discountFrom).where('discount', '<=', discountTo);
      countQuery = countQuery.where('discount', '>=', discountFrom).where('discount', '<=', discountTo);
    }

    const countResult = await countQuery.executeTakeFirstOrThrow();
    const count = parseInt(countResult.count, 10);
    const lastPage = Math.ceil(count / pageSize);

    const products = await dbQuery
      .offset((pageNo - 1) * pageSize)
      .limit(pageSize)
      .execute();

    const numOfResultsOnCurPage = products.length;
    return { products, count, lastPage, numOfResultsOnCurPage };
  } catch (error) {
    throw error;
  }
}

export async function addProduct(productData) {
  try {
    const {
      name,
      description,
      price,
      rating,
      old_price,
      discount,
      colors,
      gender,
      brands,
      occasion,
      categories,
      image_url
    } = productData;

    await db.insertInto('products').values({
      name,
      description,
      price,
      rating,
      old_price,
      discount,
      colors,
      gender,
      brands,
      occasion,
      image_url,
      created_at: new Date(),
      updated_at: new Date()
    }).execute();

    const result = await db
      .selectFrom('products')
      .select('id')
      .orderBy('id', 'desc')
      .limit(1)
      .executeTakeFirstOrThrow();

    const productId = result.id;

    if (categories && categories.length > 0) {
      const categoryInserts = categories.map(categoryId => ({
        product_id: productId,
        category_id: categoryId,
        created_at: new Date(),
        updated_at: new Date()
      }));
      await db.insertInto('product_categories').values(categoryInserts).execute();
    }

    return result;
  } catch (error) {
    console.log("Error in Product Adding!")
    throw error;
  }
}

export async function updateProduct(productId: number, productData: any) {
  try {
    const { categories, ...productFields } = productData;
    await db
      .updateTable('products')
      .set(productFields)
      .where('id', '=', productId)
      .execute();

    const result = await db
      .selectFrom('products')
      .select('id')
      .orderBy('id', 'desc')
      .limit(1)
      .executeTakeFirstOrThrow();

    return result;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function updateProductCategories(productId: number, categories: any[]) {
  try {
    await db.deleteFrom('product_categories').where('product_id', '=', productId).execute();

    const categoryInserts = categories.map(categoryId => ({
      product_id: productId,
      category_id: categoryId
    }));
    await db.insertInto('product_categories').values(categoryInserts).execute();
  } catch (error) {
    console.error('Error updating product categories:', error);
    throw error;
  }
}

export const getProduct = cache(async function getProduct(productId: number) {
  try {
    const product = await db
      .selectFrom("products")
      .selectAll()
      .where("id", "=", productId)
      .execute();

    return product;
  } catch (error) {
    return { error: "Could not find the product" };
  }
});

async function enableForeignKeyChecks() {
  await sql`SET foreign_key_checks = 1`.execute(db);
}

async function disableForeignKeyChecks() {
  await sql`SET foreign_key_checks = 0`.execute(db);
}

export async function deleteProduct(productId: number) {
  try {
    await disableForeignKeyChecks();
    await db
      .deleteFrom("product_categories")
      .where("product_categories.product_id", "=", productId)
      .execute();
    await db
      .deleteFrom("reviews")
      .where("reviews.product_id", "=", productId)
      .execute();

    await db
      .deleteFrom("comments")
      .where("comments.product_id", "=", productId)
      .execute();

    await db.deleteFrom("products").where("id", "=", productId).execute();

    await enableForeignKeyChecks();
    revalidatePath("/products");
    return { message: "success" };
  } catch (error) {
    return { error: "Something went wrong, Cannot delete the product" };
  }
}

export async function MapBrandIdsToName(brandsId) {
  const brandsMap = new Map();
  try {
    for (let i = 0; i < brandsId.length; i++) {
      const brandId = brandsId.at(i);
      const brand = await db
        .selectFrom("brands")
        .select("name")
        .where("id", "=", +brandId)
        .executeTakeFirst();
      brandsMap.set(brandId, brand?.name);
    }
    return brandsMap;
  } catch (error) {
    throw error;
  }
}

export async function getAllProductCategories(products: any) {
  try {
    const productsId = products.map((product) => product.id);
    const categoriesMap = new Map();

    for (let i = 0; i < productsId.length; i++) {
      const productId = productsId.at(i);
      const categories = await db
        .selectFrom("product_categories")
        .innerJoin(
          "categories",
          "categories.id",
          "product_categories.category_id"
        )
        .select("categories.name")
        .where("product_categories.product_id", "=", productId)
        .execute();
      categoriesMap.set(productId, categories);
    }
    return categoriesMap;
  } catch (error) {
    throw error;
  }
}

export async function getProductCategories(productId: number) {
  try {
    const categories = await db
      .selectFrom("product_categories")
      .innerJoin(
        "categories",
        "categories.id",
        "product_categories.category_id"
      )
      .select(["categories.id", "categories.name"])
      .where("product_categories.product_id", "=", productId)
      .execute();

    return categories;
  } catch (error) {
    throw error;
  }
}
