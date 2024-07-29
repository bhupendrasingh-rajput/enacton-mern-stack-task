## Project Overview

This Next.js application provides a comprehensive solution for managing products, including adding, editing, sorting, and filtering functionalities. The application is built using Next.js, Kysely, and MySQL, ensuring a robust and scalable backend with a modern frontend framework.

## Github Repo:

https://github.com/bhupendrasingh-rajput/enacton-mern-stack-task

### Setting Up the Project

To set up the project locally, follow these steps:

1. Clone the repository and navigate to the project folder.
2. Import the product_database.sql file in to your MySQL database (you can use phpMyAdmin).
3. Update the .env file with your own MySQL credentials.
4. Run `npm install --force`.
5. Start the project using `npm run dev`.
6. Access the NextJS website at http://localhost:3000.
7. Setup the database, You would need mysql and workbench for the database. You can get it from here: https://dev.mysql.com/downloads/installer. To Import data in do refer to this document: https://dev.mysql.com/doc/workbench/en/wb-admin-export-import-management.html

### Features

1. **Add Product** : Add new products with details such as name, description, price, discount, colors, gender, brands, occasion, categories, and image.

2. **Sorting** : Sort products by various criteria like price, rating, and date.
   
3. **Filtering** : Filter products by brand, category, price range, gender, occasion, and discount.

4. **Pagination** : Paginated view of products for easy navigation.
   
5. **Edit Product** : Update existing product details.

6. **Delete Product** : Remove products from the database.

### Features Implementation 
1. **Add Product** -
   1. Navigate to the "Add Product" page.
   2. Fill in the product details, including name, description, price, discount, colors, gender, brands, occasion, categories, and image.
   3. Click "Submit" to add the product.
   
2. **Edit Product** -
   1. Navigate to the "Product List" page.
   2. Click the "Edit" button next to the product you want to update.
   3. Update the necessary details.
   4. Click "Submit" to save the changes.

3. **Delete Product** -
   1. Navigate to the "Product List" page.
   2. Click the "Delete" button next to the product you want to remove.
   3. Confirm the deletion to remove the product from the database.

4. **Sorting** -
   1. Use the sorting options on the "Product List" page to sort products by various criteria such as price, rating, and date.

5. **Filtering** -
    1. Use the filtering options on the "Product List" page to filter products by brand, category, price range, gender, occasion, and discount.

11. **Pagination**
6.1 Use the pagination controls on the "Product List" page to navigate through the list of products.

### Application Demo
You can view a demo video of the application showcasing the implemented functionalities with below link.

**Demo Link** : https://drive.google.com/file/d/1TfNj4ljeCaIeY46iYrqYdTlmRsQ3Zwjo/view?usp=drivesdk
