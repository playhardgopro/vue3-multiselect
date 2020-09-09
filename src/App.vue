<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/> -->
    <!-- <input v-model="token" /> -->
    <div style="width: 500px; padding: 1rem 3rem;">
      <Multi-select
        v-model="model"
        option-id-name="id"
        :options="options"
        :async-function="requestProfiles.bind(this)"
        :trackBy="trackBy"
        :placeholder="placeholder"
        :disabled="disabled"
        :no-options-found="noOptionsFound"
      />
    </div>
  </div>
</template>

<script lang="ts">
// import { Options, Vue } from "vue-class-component";
// import HelloWorld from "./components/HelloWorld.vue";
// import Select from "./components/select/select.vue";
import MultiSelect from "./components/multi-select/multi-select.vue";

async function request(searchQuery: string) {
  function response(): User[] {
    return ["Irina", "Mary", "Olga"].map((user, index) => ({
      name: user,
      number: index,
      id: `${user}-${index}-UUID`,
    }));
  }
  let promise: Promise<User[]> = new Promise((resolve) => {
    setTimeout(() => {
      resolve(response());
    }, 1000);
  });
  const res = await promise;
  return res.filter((user) => {
    return user["name"].includes(searchQuery);
  });
}

// @Options({

// })
export default {
  name: "App",
  components: {
    // HelloWorld,
    MultiSelect,
    // Select,
  },
  data() {
    return {
      model: [
        {
          name: "Daniel",
          number: 0,
          id: "Daniel-0-UUID",
        },
      ],
      token: "",
      trackBy: "name",
      disabled: false,
      placeholder: "Placeholder",
      noOptionsFound: "Not found",
    };
  },
  computed: {
    options() {
      return ["Daniel", "Oleg", "Boris"].map((user, index) => ({
        name: user,
        number: index,
        id: `${user}-${index}-UUID`,
      }));
    },
  },
  methods: {
    async requestProfiles(searchQuery: string) {
      return request(searchQuery);
    },
  },
};
declare interface User {
  name: string;
  number: number;
  id: string;
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
