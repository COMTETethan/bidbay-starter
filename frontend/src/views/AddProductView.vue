<script setup>
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";
import { ref } from "vue";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();

const isFormValid = ref(false);
const isLoading = ref(false);
const error = ref("");

const Name = ref("");
const description = ref("");
const category = ref("");
const originalPrice = ref("");
const pictureUrl = ref("");
const endDate = ref("");

const InputChange = () => {
  isFormValid.value = Name.valuelue.trim() !== "" &&
    description.valuelue.trim() !== "" &&
    category.valuelue.trim() !== "" &&
    originalPrice.valuelue.trim() !== "" &&
    pictureUrl.valuelue.trim() !== "" &&
    endDate.valuelue.trim() !== ""
}

const Submit = async (event)=> {
  event.preventDefault();

isLoading.value = true;

const response = await fetch("http://localhost:3000/api/products", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token.value}`,
  },
  body: JSON.stringify({
    name: Name.value,
    description: description.value,
    category: category.value,
    originalPrice: originalPrice.value,
    pictureUrl: pictureUrl.value,
    endDate: endDate.value,
  }),
});

isLoading.value = false;
if (!response.ok) {
  error.value = "Une erreur s'est produite";
  return;
}
const data = await response.json();
router.push({ name: "Product", params: { productId: data.id } });
};


if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}


</script>

<template>
  <h1 class="text-center">Ajouter un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit.prevent="Submit">
        <div class="alert alert-danger mt-4" role="alert" v-if="error" data-test-error>
          {{ error }}
          Une erreur c'est produite..
        </div>

        <div class="mb-3">
          <label for="product-name" class="form-label"> Nom du produit </label>
          <input
            type="text"
            class="form-control"
            id="product-name"
            v-model="Name"
            required
            data-test-product-name
          />
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">
            Description
          </label>
          <textarea
            class="form-control"
            id="product-description"
            name="description"
            rows="3"
            v-model="description"
            required
            data-test-product-description
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input
            type="text"
            class="form-control"
            id="product-category"
            v-model="category"
            required
            data-test-product-category
          />
        </div>

        <div class="mb-3">
          <label for="product-original-price" class="form-label">
            Prix de départ
          </label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              id="product-original-price"
              name="originalPrice"
              step="1"
              min="0"
              v-model="originalPrice"
              required
              data-test-product-price
            />
            <span class="input-group-text">€</span>
          </div>
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">
            URL de l'image
          </label>
          <input
            type="url"
            class="form-control"
            id="product-picture-url"
            name="pictureUrl"
            v-model="pictureUrl"
            required
            data-test-product-picture
          />
        </div>

        <div class="mb-3">
          <label for="product-end-date" class="form-label">
            Date de fin de l'enchère
          </label>
          <input
            type="date"
            class="form-control"
            id="product-end-date"
            name="endDate"
            v-model="endDate"
            required
            data-test-product-end-date
          />
        </div>

        <div class="d-grid gap-2">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isLoading"
            data-test-submit
          >
            Ajouter le produit
            <span
              v-if="isLoading"
              data-test-spinner
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
