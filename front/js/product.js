/**
 * Définit l'URL de l'API /products/
 * @constant {string}
 */
const url = 'http://localhost:3000/api/products/';

/**
 * Référence vers l'élément HTML qui va contenir la liste des produits.
 * @type {HTMLElement}
 */
const productList = document.getElementById("items");

/**
 * Effectue une requête GET à l'URL spécifiée pour récupérer les produits depuis l'API
 * et les affiche sur la page.
 */
const fetchProducts = () => {
  // Effectue une requête GET à l'URL spécifiée pour récupérer les données
  fetch(url)
    .then((response) => response.json()) // Convertir la réponse en format JSON
    .then(function (couches) {
      /**
       * Construit une chaîne de caractères pour stocker les éléments de produits
       * @type {string}
       */
      let productsHTML = '';

      // Itération des clés des produits renvoyés par l'API
      for (let couch of couches) {
        // Crée un élément HTML pour chaque produit et l'ajoute à la liste de produits qui apparaît sur la page.
        productList.innerHTML += `
          <a href="./product.html?id=${couch._id}">
            <article>
              <!-- Affichage de l'image du produit et son texte alternatif -->
              <img src="${couch.imageUrl}" alt="${couch.altTxt}">
              <!-- Affichage du nom du produit -->
              <h3 class="productName">${couch.name}</h3>
              <!-- Affichage de la description du produit -->
              <p class="productDescription">${couch.description}</p>
            </article>
          </a>`;
      }
    })
    .catch((error) => {
      // Gestion des erreurs en cas de problème avec la requête fetch
      console.error('Erreur lors de la récupération des produits:', error);
    });
};

// Appelle la fonction d'extraction et d'affichage des produits de l'API.
fetchProducts();

/**
 * Récupère les détails du produit depuis l'API et les affiche sur la page.
 * @param {string} productId - L'identifiant du produit à récupérer.
 */
const fetchProduct = (productId) => {
  const url = `http://localhost:3000/api/products/${productId}`;
  // Effectuer une requête fetch vers l'API pour récupérer les détails du produit
  fetch(url)
    .then((response) => response.json()) // Convertir la réponse en format JSON
    .then(function (couch) {
      // Créer un élément image pour afficher l'image du produit
      const addImage = document.createElement('img');
      addImage.setAttribute('src', couch.imageUrl);
      addImage.setAttribute('alt', couch.altTxt);

      // Ajouter l'image à l'élément ayant la classe .item__img
      const itemImg = document
        .querySelector('.item__img')
        .appendChild(addImage);

      // Récupérer et afficher le nom, le prix et la description du produit
      const titleElement = document.getElementById('title');
      titleElement.innerHTML = couch.name;

      const priceElement = document.getElementById('price');
      priceElement.innerHTML = couch.price;

      const descriptionElement = document.getElementById('description');
      descriptionElement.innerHTML = couch.description;

      // Récupérer l'élément de sélection des couleurs
      const colorsElement = document.getElementById('colors');
      colorsElement.innerHTML = ''; // Réinitialiser les options pour éviter les doublons

      // Parcourir les couleurs du produit et ajouter des options au sélecteur de couleurs
      for (const color of couch.colors) {
        colorsElement.innerHTML += `<option value="${color}">${color}</option>`;
      }
    });
};

/**
 * Ajoute le produit sélectionné au panier, en tenant compte de sa quantité.
 * @param {string} productId - L'identifiant du produit à ajouter au panier.
 */
const addToCart = (productId) => {
  // Récupérer la quantité sélectionnée par l'utilisateur
  const quantity = +document.getElementById('quantity').value;

  // Vérifier si la quantité est supérieure à 0
  if (quantity > 0) {
    const product = {
      id: productId,
      color: document.getElementById('colors').value,
      quantity: quantity,
    };

    // Récupérer les produits déjà présents dans le panier depuis le stockage local
    let cart = [];
    if (localStorage.getItem('cart') !== null) {
      cart = JSON.parse(localStorage.getItem('cart'));
    }

    // Vérifier si le produit est déjà présent dans le panier en fonction de son ID et de la couleur
    const existingProductIndex = cart.findIndex(
      (item) => item.id === product.id && item.color === product.color
    );

    if (existingProductIndex !== -1) {
      // Le produit est déjà présent dans le panier
      // Mettre à jour la quantité si la nouvelle valeur est différente de l'ancienne
      cart[existingProductIndex].quantity += product.quantity;
      // Afficher un message indiquant que la quantité du produit a été mise à jour (facultatif)
      console.log('La quantité du produit a été mise à jour.');
    } else {
      // Le produit n'existe pas encore dans le panier, l'ajouter à la liste
      cart.push(product);
      // Afficher un message indiquant que le produit a été ajouté au panier (facultatif)
      console.log('Le produit a été ajouté au panier.');
    }

    // Sauvegarder la liste mise à jour dans le stockage local
    localStorage.setItem('cart', JSON.stringify(cart));
  } else {
    // Afficher un message d'erreur si la quantité est égale à 0
    console.error('La quantité du produit doit être supérieure à 0 pour l\'ajouter au panier.');
  }
};


// Récupère l'identifiant du produit à partir des paramètres de la requête dans l'URL
const queryParams = new URL(document.location).searchParams;
const id = queryParams.get('id');

// Appeler la fonction pour récupérer et afficher les détails du produit au chargement de la page
fetchProduct(id);

// Récupérer le bouton "Ajouter au panier" et ajouter un écouteur d'événements pour déclencher l'ajout au panier
const addToCartButton = document.getElementById('addToCart');
addToCartButton.addEventListener('click', () => addToCart(id));
