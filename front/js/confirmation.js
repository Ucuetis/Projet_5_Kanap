/**
 * Gestionnaire d'événements qui s'exécute lorsque le DOM est complètement chargé.
 * Récupère le numéro de commande depuis les paramètres d'URL et l'affiche dans la page de confirmation.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Récupérer les paramètres de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  
  // Récupérer le numéro de commande depuis les paramètres d'URL
  const orderId = urlParams.get("orderId");
  
  // Vérifier si le numéro de commande existe dans les paramètres d'URL
  if (orderId) {
    // Sélectionner l'élément HTML où le numéro de commande doit être affiché
    const orderIdPlaceholder = document.querySelector(".confirmation span#orderId");
    
    // Afficher le numéro de commande dans l'élément HTML
    orderIdPlaceholder.textContent = orderId;
  }
});

