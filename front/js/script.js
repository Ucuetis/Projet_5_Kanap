/**
 * Définit l'URL de l'API /products/
 * @constant {string}
 */
const url = 'http://localhost:3000/api/products/';

/**
 * Récupération de la référence vers l'élément HTML qui va contenir la liste des produits
 * @type {HTMLElement}
 */
const productList = document.getElementById('items');

/**
 * Effectue une requête GET à l'URL spécifiée pour récupérer les produits depuis l'API
 * et les affiche sur la page.
 */
const fetchProducts = () => {
  fetch(url)
    .then((response) => response.json()) // Convertir la réponse en format JSON
    .then(function (products) {
      /**
       * Construit une chaîne de caractères pour stocker les éléments de produits
       * @type {string}
       */
      let productsHTML = '';

      // Itération des produits renvoyés par l'API
      for (let product of products) {
        // Crée un élément HTML pour chaque produit et l'ajoute à la liste de produits qui apparaît sur la page.
        productsHTML += `
          <a href="./product.html?id=${product._id}">
            <article>
              <!-- Affichage de l'image du produit et son texte alternatif -->
              <img src="${product.imageUrl}" alt="${product.altTxt}">
              <!-- Affichage du nom du produit -->
              <h3 class="productName">${product.name}</h3>
              <!-- Affichage de la description du produit -->
              <p class="productDescription">${product.description}</p>
            </article>
          </a>`;
      }

      // Insère les éléments de produits dans le conteneur productList
      productList.innerHTML = productsHTML;
    })
    .catch((error) => {
      // Gestion des erreurs en cas de problème avec la requête fetch
      console.error('Erreur lors de la récupération des produits:', error);
    });
};

// Appelle la fonction d'extraction et d'affichage des produits de l'API.
fetchProducts();
