<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../store/auth";

const { isAuthenticated, isAdmin, userData, token } = useAuthStore();

const route = useRoute();

const productId = ref(route.params.productId);

/**
 * @type {Product}
 * @property {Product} product.id - The product unique ID.
 * @property {string} product.name - The product name.
 * @property {number} product.originalPrice - The original price of the product.
 * @property {string} product.endDate -  The product end of bidding date.
 * @property {string} product.description -  The product description.
 * @property {string} product.pictureUrl -  The product picture URL.
 * @property {string} product.seller.username -  The product seller username.   
 * @property {string} product.sellerId -  The product seller ID.   
 */
const product = ref();
const error = ref(false);
const loading = ref(true);
const price = ref(0);

/**
 * @param {number|string|Date|VarDate} date
 */
function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}


async function addBid () {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId.value}/bids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({ price: price.value }),
    });

    if (!response.ok) {
      error.value = true;
    } else {
      await fetchProduct();
    }
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

const disabledAddBid = computed(() => {
  const maxPrice = lastBid.value?.price ?? 10;
  return price.value <= maxPrice;
});

/**
 * @type {Computed<number|null>}
 */
const lastBid = computed(() => {
  if (product.value.bids.length > 0) {
    return product.value.bids.slice(-1)[0] ?? null;
  }
  return null;
});

async function deleteBid(bidId) {
  try {
    await fetch("http://localhost:3000/api/bids/" + bidId, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
  } catch (e) {
    console.error(e);
    error.value = true;
  } finally {
    await fetchProduct();
    loading.value = false;
  }
}

async function fetchProduct() {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId.value}`);
    if(!response.ok) {
      error.value = true;
    } else {
      product.value = await response.json();
      loading.value = false;
    }

  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

const countdown = computed (() => {
  const diff = new Date(product.value.endDate) - new Date();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if(diff < 0) return "Terminé";

  return `${days} jours, ${hours} heures, ${minutes} minutes et ${seconds} secondes`;
});

fetchProduct();

</script>

<template>

  <div class="row">
    <div v-if="loading && !error" class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-4" role="alert" data-test-error>
      Une erreur est survenue lors du chargement des produits.
    </div>
    <div v-if="!loading && !error" class="row" data-test-product>
      <!-- Colonne de gauche : image et compte à rebours -->
      <div class="col-lg-4">
        <img
          :src="product.pictureUrl"
          alt=""
          class="img-fluid rounded mb-3"
          data-test-product-picture
        />
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Compte à rebours</h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted" data-test-countdown>
              Temps restant : {{ countdown }}
            </h6>
          </div>
        </div>
      </div>

      <!-- Colonne de droite : informations du produit et formulaire d'enchère -->
      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-6">
            <h1 class="mb-3" data-test-product-name>
              {{ product.name }}
            </h1>
          </div>
          <div class="col-lg-6 text-end">
            <RouterLink
              :to="{ name: 'ProductEdition', params: { productId: product.id } }"
              class="btn btn-primary"
              data-test-edit-product
            >
              Editer
            </RouterLink>
            &nbsp;
            <button class="btn btn-danger" data-test-delete-product>
              Supprimer
            </button>
          </div>
        </div>

        <h2 class="mb-3">Description</h2>
        <p data-test-product-description>
          {{ product.description }}
        </p>

        <h2 class="mb-3">Informations sur l'enchère</h2>
        <ul>
          <li data-test-product-price>Prix de départ : {{ product.originalPrice }} €</li>
          <li data-test-product-end-date>Date de fin : {{ formatDate(product.endDate) }}</li>
          <li>
            Vendeur :
            <router-link
              :to="{ name: 'User', params: { userId: product.sellerId } }"
              data-test-product-seller
            >
              {{ product.seller.username }}
            </router-link>
          </li>
        </ul>

        <h2 class="mb-3">Offres sur le produit</h2>
        <table class="table table-striped" data-test-bids>
          <thead>
            <tr>
              <th scope="col">Enchérisseur</th>
              <th scope="col">Offre</th>
              <th scope="col">Date</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bid in product.bids" :key="bid.id" data-test-bid>
              <td>
                <router-link
                  :to="{ name: 'User', params: { userId: bid.bidderId } }"
                  data-test-bid-bidder
                >
                  {{ bid.bidder.username }}
                </router-link>
              </td>
              <td data-test-bid-price>{{ bid.price }} €</td>
              <td data-test-bid-date>{{ formatDate(bid.date) }}</td>
              <td>
                <button class="btn btn-danger btn-sm" data-test-delete-bid v-if="isAdmin || (isAuthenticated && userData.id === bid.bidder.id)" @click="deleteBid(bid.id)">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p data-test-no-bids v-if="product.bids.length === 0">Aucune offre pour le moment</p>

        <form data-test-bid-form @submit.prevent="addBid">
          <div class="form-group">
            <label for="bidAmount">Votre offre :</label>
            <input
              type="number"
              class="form-control"
              id="bidAmount"
              v-model="price"
              data-test-bid-form-price 
            />
            <small class="form-text text-muted">
              Le montant doit être supérieur à {{ lastBid?.price ?? 10 }} €.
            </small>
          </div>
          <button
            type="submit" class="btn btn-primary" :disabled='disabledAddBid' data-test-submit-bid>
            Enchérir
          </button>
        </form>
      </div>
    </div>
  </div>
</template>