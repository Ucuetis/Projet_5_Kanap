/**
 * L'URL de base de l'API.
 * @type {string}
 */
const API_URL = 'http://localhost:3000/api/products';

/**
 * Référence vers le conteneur des éléments du panier dans le DOM.
 * @type {HTMLElement}
 */
const cartItemsContainer = document.getElementById('cart__items');

/**
 * Référence vers l'élément affichant la quantité totale d'articles dans le panier.
 * @type {HTMLElement}
 */
const totalQuantityElement = document.getElementById('totalQuantity');

/**
 * Référence vers l'élément affichant le prix total des articles dans le panier.
 * @type {HTMLElement}
 */
const totalPriceElement = document.getElementById('totalPrice');

/**
 * Les éléments du panier récupérés depuis le stockage local.
 * @type {Array}
 */
const cartItems = getCartItemsFromLocalStorage();

/**
 * Une carte de détails de produits pour éviter des appels redondants à l'API.
 * @type {Map}
 */
const productDetailsMap = new Map();

/**
 * Tableau contenant les noms des champs du formulaire.
 * @type {string[]}
 */
const FIELD_NAMES = ['firstName', 'lastName', 'address', 'city', 'email'];

/**
 * Référence vers le formulaire de commande dans le DOM.
 * @type {HTMLFormElement}
 */
const orderForm = document.querySelector('.cart__order__form');

/**
 * Récupère les éléments du panier depuis le stockage local.
 *
 * @returns {Array} - Les éléments du panier récupérés depuis le stockage local ou un tableau vide s'il n'y a rien.
 */
function getCartItemsFromLocalStorage() {
  const cartItemsFromStorage = JSON.parse(localStorage.getItem('cart'));
  return cartItemsFromStorage || [];
}

/**
 * Récupère les informations d'un produit depuis l'API en utilisant son ID.
 *
 * @async
 * @param {string} productId - L'ID du produit à récupérer.
 * @returns {Promise<object|null>} - Une promesse contenant les informations du produit ou null en cas d'erreur.
 */
async function fetchProductDetailsFromAPI(productId) {
  try {
    // Vérifiez d'abord si les détails du produit sont déjà dans la carte
    if (productDetailsMap.has(productId)) {
      return productDetailsMap.get(productId);
    }

    const response = await fetch(`${API_URL}/${productId}`);
    if (!response.ok) {
      throw new Error(
        `La réponse du réseau n’était pas correcte: ${response.status} ${response.statusText}`
      );
    }

    const product = await response.json();

    // Stockez les détails du produit dans la carte
    productDetailsMap.set(productId, product);

    return product;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return null;
  }
}

/**
 * Met à jour les éléments du panier dans le stockage local.
 *
 * @param {Array} items - Les éléments du panier à enregistrer dans le stockage local.
 * @returns {void}
 */
function updateCartItemsInLocalStorage(items) {
  localStorage.setItem('cart', JSON.stringify(items));
}

/**
 * Affiche un message d'alerte dans le conteneur prévu à cet effet et efface les anciens messages.
 *
 * @param {string} message - Le message d'alerte à afficher.
 * @returns {void}
 */
function displayAlert(message) {
  // Récupérez le conteneur d'alertes
  const alertContainer = document.getElementById('cartAndFormContainer');

  // Effacez d'abord les anciens messages d'alerte
  alertContainer.innerHTML = '';

  // Créez un nouvel élément pour le message d'alerte
  const alertElement = document.createElement('div');
  alertElement.className = 'alert';

  // Créez une balise h1 pour le message
  const h1 = document.createElement('h1');
  h1.textContent = message;

  // Ajoutez le message d'alerte à la balise h1
  alertElement.appendChild(h1);

  // Ajoutez le message d'alerte au conteneur
  alertContainer.appendChild(alertElement);

  // Utilisez setTimeout pour effacer le message après 3 secondes
  setTimeout(() => {
    alertContainer.removeChild(alertElement);
  }, 3000); // Le message disparaîtra après 3 secondes (3000 millisecondes)
}

/**
 * Génère le contenu HTML pour un article du panier.
 *
 * @param {object} item - L'élément du panier.
 * @param {object} product - Les détails du produit.
 * @returns {HTMLElement} - L'élément HTML représentant l'article du panier.
 */
function createCartItemElement(item, product) {
  const itemPrice = product.price ?? 0;
  const formattedPrice = (itemPrice * item.quantity).toFixed(2);

  const cartItemElement = document.createElement('article');
  cartItemElement.className = 'cart__item';
  cartItemElement.dataset.id = item.id;
  cartItemElement.dataset.color = item.color;

  cartItemElement.innerHTML = `
      <div class="cart__item__img">
        <img src="${product.imageUrl}" alt="${product.altTxt}">
      </div>
      <div class="cart__item__content">
        <div class="cart__item__content__description">
          <h2>${product.name}</h2>
          <p>${item.color}</p>
          <p>${formattedPrice} </p>
        </div>
        <div class="cart__item__content__settings">
          <div class="cart__item__content__settings__quantity">
            <p>Qté : </p>
            <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${item.quantity}">
          </div>
          <div class="cart__item__content__settings__delete">
            <p class="deleteItem">Supprimer</p>
          </div>
        </div>
      </div>
    `;

  // Ajouter un gestionnaire d'événements pour la modification de la quantité
  const quantityInput = cartItemElement.querySelector('.itemQuantity');
  quantityInput.addEventListener('change', () => {
    // Mettre à jour la quantité dans le localStorage
    item.quantity = parseInt(quantityInput.value, 10);
    updateCartItemsInLocalStorage(cartItems);

    // Mettre à jour l'affichage du panier après la modification de la quantité
    updateCartDisplay();
  });

  // Ajouter un gestionnaire d'événements pour la suppression de l'article
  const deleteButton = cartItemElement.querySelector('.deleteItem');
  deleteButton.addEventListener('click', () => {
    // Supprimer l'article du panier
    const itemIndex = cartItems.indexOf(item);
    if (itemIndex !== -1) {
      cartItems.splice(itemIndex, 1);
      updateCartItemsInLocalStorage(cartItems);
    }

    // Mettre à jour l'affichage du panier après la suppression de l'article
    updateCartDisplay();
  });

  return cartItemElement;
}

/**
 * Vérifie la validité d'une adresse email en utilisant une expression régulière.
 *
 * @param {string} email - L'adresse email à vérifier.
 * @returns {boolean} - True si l'adresse email est valide, sinon false.
 */
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Met à jour l'affichage du panier en utilisant les données stockées dans le localStorage.
 *
 * @async
 * @returns {void}
 */
async function updateCartDisplay() {
  try {
    // Récupérer les détails de tous les produits en parallèle
    const productDetailsArray = await Promise.all(
      cartItems.map((item) => fetchProductDetailsFromAPI(item.id))
    );

    // Calculer le montant total en centimes pour l'ensemble des produits dans le panier
    const totalCents = cartItems.reduce((total, item, index) => {
      const product = productDetailsArray[index];
      const itemPrice = product?.price || 0;
      return total + itemPrice * item.quantity;
    }, 0);

    // Mettre à jour l'affichage du panier
    cartItemsContainer.innerHTML = '';

    if (cartItems.length === 0) {
      // Le panier est vide, affichez le message "Votre panier est vide !"
      displayAlert('Votre panier est vide !');
    } else {
      cartItems.forEach((item, index) => {
        const product = productDetailsArray[index];
        if (!product) return;

        const cartItemElement = createCartItemElement(item, product);
        cartItemsContainer.appendChild(cartItemElement);
      });

      // Mettre à jour l'affichage de la quantité totale d'articles dans le panier
      totalQuantityElement.textContent = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );

      // Mettre à jour l'affichage du prix total des articles dans le panier
      const formattedTotalPrice = totalCents.toFixed(2);
      totalPriceElement.textContent = `${formattedTotalPrice} `;
    }
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'affichage du panier:",
      error
    );
  }
}

// Fonction de validation des champs du formulaire
/**
 * Valide les champs du formulaire en vérifiant s'ils sont vides et si l'adresse e-mail est valide.
 *
 * @param {HTMLFormElement} form - Le formulaire à valider.
 * @returns {boolean} - True si tous les champs sont valides, sinon false.
 */
function validateFormFields(form) {
  let isValid = true;

  // Parcours des champs du formulaire
  for (const fieldName of FIELD_NAMES) {
    const input = form.elements[fieldName];
    const value = input.value.trim();

    // Vérification de champ vide
    if (value === '') {
      isValid = false;
      displayAlert(`Le champ "${fieldName}" ne peut pas être vide.`);
    }

    // Vérification de l'adresse e-mail
    if (fieldName === 'email' && !isValidEmail(value)) {
      isValid = false;
      displayAlert('Veuillez saisir une adresse e-mail valide.');
    }
  }

  return isValid;
}

// Gestionnaires d'événements pour la validation des champs du formulaire
/**
 * Gestionnaire d'événement pour la modification d'un champ du formulaire.
 * Valide le champ correspondant lorsque l'utilisateur interagit avec lui.
 *
 * @param {Event} event - L'événement de modification.
 */
function handleFieldChange(event) {
  // Effacez les anciens messages d'alerte
  const alertContainer = document.getElementById('cartAndFormContainer');
  alertContainer.innerHTML = '';
}

/**
 * Gestionnaire d'événements pour la soumission du formulaire de commande.
 *
 * @param {Event} event - L'événement de soumission du formulaire.
 * @returns {void}
 */
orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  /**
   * La valeur saisie dans le champ du prénom.
   * @type {string}
   */
  const firstName = document.getElementById('firstName').value;

  /**
   * La valeur saisie dans le champ du nom.
   * @type {string}
   */
  const lastName = document.getElementById('lastName').value;

  /**
   * La valeur saisie dans le champ de l'adresse.
   * @type {string}
   */
  const address = document.getElementById('address').value;

  /**
   * La valeur saisie dans le champ de la ville.
   * @type {string}
   */
  const city = document.getElementById('city').value;

  /**
   * La valeur saisie dans le champ de l'adresse e-mail.
   * @type {string}
   */
  const email = document.getElementById('email').value;

  // Valider les champs du formulaire
  if (!validateFormFields(orderForm)) {
    return;
  }

  // Récupérer les éléments du panier depuis le localStorage
  const cartItems = getCartItemsFromLocalStorage();

  // Vérifier si le panier n'est pas vide
  if (cartItems.length > 0) {
    try {
      // Créer un objet de commande pour l'API
      const order = {
        contact: {
          firstName,
          lastName,
          address,
          city,
          email,
        },
        products: [], // Initialisez la liste des produits à un tableau vide
      };

      // Utilisez une boucle pour extraire les ID de produits du panier
      for (const item of cartItems) {
        order.products.push(item.id);
      }

      // Envoyer la commande à l'API via la fonction placeOrder()
      await placeOrder(order);
    } catch (error) {
      /**
       * Gère les erreurs survenues lors de l'envoi de la commande à l'API.
       * @type {Error}
       */
      console.error('Erreur lors de la commande :', error);
      // Afficher un message d'erreur en cas de problème avec la commande
    }
  } else {
    /**
     * Message d'alerte affiché lorsque le panier est vide.
     * @type {string}
     */
    displayAlert('Votre panier est vide !');
  }
});

// Gestionnaire d'événement pour la perte de focus d'un champ du formulaire
/**
 * Gestionnaire d'événement pour la perte de focus d'un champ du formulaire.
 * Valide le champ correspondant lorsque l'utilisateur perd le focus.
 *
 * @param {Event} event - L'événement de perte de focus.
 */
function handleFieldBlur(event) {
  const input = event.target;
  const fieldName = input.name;
  const value = input.value.trim();

  // Vérification de champ vide
  if (value === '') {
    displayAlert(`Le champ "${fieldName}" ne peut pas être vide.`);
  }

  // Vérification de l'adresse e-mail
  if (fieldName === 'Email' && !isValidEmail(value)) {
    displayAlert('Veuillez saisir une adresse e-mail valide.');
  }
}

/**
 * Envoie une commande à l'API et redirige l'utilisateur vers la page de confirmation.
 *
 * @async
 * @param {object} order - L'objet de commande à envoyer.
 * @returns {Promise<void>} Une promesse résolue lorsque la commande est envoyée avec succès.
 */
async function placeOrder(order) {
  try {
    /**
     * Envoie une requête POST à l'API pour passer la commande.
     *
     * @type {Response}
     */
    const response = await fetch(`${API_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error(
        `La réponse du réseau n'était pas correcte: ${response.status} ${response.statusText}`
      );
    }

    /**
     * Les détails de la commande envoyée à l'API.
     *
     * @type {object}
     */
    const result = await response.json();

    /**
     * Stocke le numéro de commande dans le stockage local.
     */
    localStorage.setItem('orderId', result.orderId);

    /**
     * Redirige l'utilisateur vers la page de confirmation avec le numéro de commande.
     */
    window.location.href = `confirmation.html?orderId=${result.orderId}`;

    // Traitez chaque produit commandé ici si nécessaire
    for (const productId of order.products) {
      // Vous pouvez ajouter des opérations spécifiques à chaque produit commandé
    }

    /**
     * Vide le panier en supprimant les éléments du stockage local.
     */
    localStorage.removeItem('cart');
  } catch (error) {
    /**
     * Gère les erreurs survenues lors de l'envoi de la commande à l'API.
     *
     * @type {Error}
     */
    console.error("Erreur lors de l'envoi de la commande :", error);

    /**
     * Message d'erreur affiché à l'utilisateur en cas de problème avec l'envoi de la commande.
     *
     * @type {string}
     */
    const errorMessage =
      "Une erreur s'est produite lors de la commande. Veuillez réessayer plus tard.";
    displayAlert(errorMessage);
  }
}

// Fonctions asynchrones

// Initialisation

/**
 * Gestionnaire d'événements pour l'exécution du code après le chargement complet de la page.
 *
 * @param {Event} event - L'événement de chargement de la page.
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
  /**
   * Fonction asynchrone pour initialiser l'affichage du panier avec les produits actuellement ajoutés.
   *
   * @returns {Promise<void>}
   */
  async function initializePage() {
    // Attend la mise à jour de l'affichage du panier avant de continuer
    await updateCartDisplay();
  }

  // Appelez la fonction d'initialisation asynchrone.
  initializePage();

  // Vous pouvez également ajouter d'autres gestionnaires d'événements ici si nécessaire.
});

/**
 * Gestionnaire d'événements pour la soumission du formulaire de commande.
 *
 * @param {Event} event - L'événement de soumission du formulaire.
 * @returns {void}
 */
orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  /**
   * La valeur saisie dans le champ du prénom.
   * @type {string}
   */
  const firstName = document.getElementById('firstName').value;

  /**
   * La valeur saisie dans le champ du nom.
   * @type {string}
   */
  const lastName = document.getElementById('lastName').value;

  /**
   * La valeur saisie dans le champ de l'adresse.
   * @type {string}
   */
  const address = document.getElementById('address').value;

  /**
   * La valeur saisie dans le champ de la ville.
   * @type {string}
   */
  const city = document.getElementById('city').value;

  /**
   * La valeur saisie dans le champ de l'adresse e-mail.
   * @type {string}
   */
  const email = document.getElementById('email').value;

  // Valider les champs du formulaire
  if (!validateFormFields(orderForm)) {
    return;
  }

  // Récupérer les éléments du panier depuis le localStorage
  const cartItems = getCartItemsFromLocalStorage();

  // Vérifier si le panier n'est pas vide
  if (cartItems.length > 0) {
    try {
      // Créer un objet de commande pour l'API
      const order = {
        contact: {
          firstName,
          lastName,
          address,
          city,
          email,
        },
        products: [], // Initialisez la liste des produits à un tableau vide
      };

      // Utilisez une boucle pour extraire les ID de produits du panier en tenant compte de leur quantité respective
      for (const item of cartItems) {
        for (let i = 0; i < item.quantity; i++) {
          order.products.push(item.id);
        }
      }

      // Envoyer la commande à l'API via la fonction placeOrder()
      await placeOrder(order);
    } catch (error) {
      /**
       * Gère les erreurs survenues lors de l'envoi de la commande à l'API.
       * @type {Error}
       */
      console.error('Erreur lors de la commande :', error);
      // Afficher un message d'erreur en cas de problème avec la commande
    }
  } else {
    /**
     * Message d'alerte affiché lorsque le panier est vide.
     * @type {string}
     */
    displayAlert('Votre panier est vide !');
  }
});
