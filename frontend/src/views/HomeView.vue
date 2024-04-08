<script setup>
import { ref, onMounted } from "vue";
import {  } from "vue-router";

const loading = ref(true);
const error = ref(false);

/**
 * @type {Array<Product>}
 * @property {string} products.atPosition.id - The product unique ID.
 * @property {string} products.atPosition.name - The product name.
 * @property {number} products.atPosition.originalPrice - The original price of the product.
 * @property {string} products.atPosition.endDate -  The product end of bidding date.
 * @property {string} products.atPosition.description -  The product description.
 * @property {string} products.atPosition.pictureUrl -  The product picture URL.
 * @property {string} products.atPosition.seller.username -  The product seller username.   
 * @property {string} products.atPosition.sellerId -  The product seller ID.   
 */
const products = ref([]);


async function fetchProducts() {

  try {
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();
    products.value = data;

    productsSort('name');

  } catch (e) {
    error.value = true;

  } finally {
    loading.value = false;
  }
}

const textFilter = ref('');
const sort = ref('nom');

onMounted(fetchProducts);

/**
 * @param {string} sortOption - either 'price' or a default sort wich is a name based sort.
 */
function productsSort(sortOption) {
  if (sortOption === 'price') {
    products.value = products.value?.sort((a, b) => a.originalPrice - b.originalPrice);
    sort.value = 'prix';
  } else {
    products.value = products.value?.sort((a, b) => a.name.localeCompare(b.name));
    sort.value = 'nom';
  }
}

/**
 * @returns {Array<Product>} A filtered array of products based on the products name and the textFilter value.
 */
function ProductsFiltering() {
  return products.value.filter(product => product.name.toLowerCase().includes(textFilter.value.toLowerCase()));
}

/**
 * @param {Object_Product} product
 * @returns {!number}
 */
const getBestBid = (product) => {
  if (!product.bids || product.bids.length === 0) {
    return product.originalPrice;
  }

  const highestBid = product.bids.reduce((max, bid) => {
    return bid.price > max.price ? bid : max;
  });

  return highestBid.price;
};

</script>

<template>
  <div>
    <h1 class="text-center mb-4">Liste des produits</h1>

    <div class="row mb-3">
      <div class="col-md-6">
        <form>
          <div class="input-group">
            <span class="input-group-text">Filtrage</span>
            <input
              v-model="textFilter"
              sortOption="text"
              class="form-control"
              placeholder="Filtrer par nom"
              data-test-filter
            />
          </div>
        </form>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button sortOption="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-test-sorter>
            Trier par {{ sort }}
            <span class="caret"></span>
          </button>

          <ul class="dropdown-menu dropdown-menu-end">
            <li v-on:click="productsSort('name')">
              <a class="dropdown-item" href="#"> Nom </a>
            </li>
            <li v-on:click="productsSort('price')">
              <a class="dropdown-item" href="#" data-test-sorter-price>
                Prix
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-4" role="alert" data-test-error>
      Une erreur est survenue lors du chargement des produits.
    </div>

    <div v-if="!loading && !error" class="row">
      <div v-for="product in ProductsFiltering()" :key="product.id" class="col-md-4 mb-4" data-test-product>
        <div class="card">
          <RouterLink :to="{ name: 'Product', params: { productId: product.id } }">
            <img :src="product.pictureUrl" class="card-img-top" :alt="product.name" data-test-product-picture>
          </RouterLink>
          <div class="card-body">
            <h5 class="card-title">
              <RouterLink :to="{ name: 'Product', params: { productId: product.id } }" data-test-product-name>
                {{ product.name }}
              </RouterLink>
            </h5>
            <p class="card-text" data-test-product-description>{{ product.description }}</p>
            <p class="card-text">
              Vendeur :
              <RouterLink
                data-test-product-seller
                :to="{ name: 'User', params: { userId: product.sellerId } }"
              >
              {{product.seller.username}}
              </RouterLink>
            </p>
            <p class="card-text" data-test-product-date>
              <span v-if="new Date(product.endDate) > new Date()">
                En cours jusqu'au {{ new Date(product.endDate).toLocaleDateString('fr-FR') }}
              </span>
              <span v-else>
                Terminé
              </span>
            </p>
            <p class="card-text" data-test-product-price>
              Prix de départ : {{ product.originalPrice }} €
            </p>
            <p class="card-text" data-test-product-price>
              Prix actuel : {{ getBestBid(product) }} €
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
