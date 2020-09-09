<template>
  <div class="select__container">
    <div
      ref="control"
      class="select__control"
      :class="{ disabled: disabled }"
      @click="showOptions"
    >
      <div
        v-if="isOptionSelected"
        :key="selectedOption[optionIdName]"
        class="select__tag"
      >
        <span>{{ selectedOption[trackBy] }}</span>
        <!-- <span v-if="!disabled" class="select__delete" @click="deleteTag()">
          <svg viewBox="0 0 492 492">
            <path
              fill="currentColor"
              d="M300.188,246L484.14,62.04c5.06-5.064,7.852-11.82,7.86-19.024c0-7.208-2.792-13.972-7.86-19.028L468.02,7.872c-5.068-5.076-11.824-7.856-19.036-7.856c-7.2,0-13.956,2.78-19.024,7.856L246.008,191.82L62.048,7.872c-5.06-5.076-11.82-7.856-19.028-7.856c-7.2,0-13.96,2.78-19.02,7.856L7.872,23.988c-10.496,10.496-10.496,27.568,0,38.052L191.828,246L7.872,429.952c-5.064,5.072-7.852,11.828-7.852,19.032c0,7.204,2.788,13.96,7.852,19.028l16.124,16.116c5.06,5.072,11.824,7.856,19.02,7.856c7.208,0,13.968-2.784,19.028-7.856l183.96-183.952l183.952,183.952c5.068,5.072,11.824,7.856,19.024,7.856h0.008c7.204,0,13.96-2.784,19.028-7.856l16.12-16.116c5.06-5.064,7.852-11.824,7.852-19.028c0-7.204-2.792-13.96-7.852-19.028L300.188,246z"
            />
          </svg>
        </span> -->
      </div>
      <input
        v-model="inputSearch"
        class="select__input"
        type="text"
        :disabled="disabled"
        :placeholder="placeholderInput"
        :readonly="isOptionSelected"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown.delete="handleClear"
      />
      <div class="arrow" :class="{ rotated: !isOptionsShown }"></div>
    </div>
    <div v-show="isOptionsShown" class="select__list-container-wrapper">
      <div class="select__list-container" v-show="isOptionsShown">
        <span
          class="select__option select__option_clickable"
          v-show="showLoader"
        >
          <loading
            style="position: absolute; top: 0; left: 0;"
            :scale="0.15"
            centered
          />
        </span>
        <slot name="dropdown-start"></slot>
        <ul v-if="!showLoader">
          <li
            v-for="(option, id) in OPTIONS_FROM_SERVER"
            :key="`option-from-server-${option[optionIdName]}-${id}`"
          >
            <span
              class="select__option select__option_clickable"
              :class="{
                selected: selectedOption[optionIdName] === option[optionIdName],
              }"
              @click="handleSelectOption(option)"
            >
              {{ option[trackBy] || noSuchField }}
            </span>
          </li>
          <template v-if="!OPTIONS_FROM_SERVER.length && cashedInput === null">
            <li
              v-for="(option, id) in DEFAULT_OPTIONS"
              :key="`option-${option[optionIdName]}-${id}`"
            >
              <span
                class="select__option select__option_clickable"
                :class="{
                  selected:
                    selectedOption[optionIdName] === option[optionIdName],
                }"
                @click="handleSelectOption(option)"
              >
                {{ option[trackBy] || noSuchField }}
              </span>
            </li>
            <li
              v-for="(option, id) in OPTIONS_LIMIT"
              :key="`option-limit-${option[optionIdName]}-${id}`"
            >
              <span
                class="select__option select__option_clickable"
                :class="{
                  selected:
                    selectedOption[optionIdName] === option[optionIdName],
                }"
                @click="handleSelectOption(option)"
              >
                {{ option[trackBy] || noSuchField }}
              </span>
            </li>
          </template>
        </ul>
        <template v-if="!OPTIONS_FROM_SERVER.length && cashedInput !== null">
          <div v-show="isNoOption" class="select__option">
            {{ noOptionsFound }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import Loading from "../loading/loading.vue";

function debounce(func, wait, immediate) {
  let timeout;

  return function executedFunction() {
    const context = this;
    const args = arguments;

    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

export default {
  name: "SelectComponent",
  components: { Loading },
  props: {
    options: { type: Array, default: () => [] },
    // debounceTime: { type: Number, default: 500 },
    placeholder: {
      type: String,
      default: "",
    },
    asyncFunction: {
      type: Function,
      default: () => {},
    },
    trackBy: {
      type: String,
      default: "name",
    },
    noSuchField: {
      type: String,
      default: "No data",
    },
    noOptionsFound: {
      type: String,
      default: "Not found",
    },
    propInput: {},
    optionIdName: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  model: {
    prop: "propInput",
    event: "select",
  },
  data() {
    return {
      // inputSearch: this.propInput,
      isOptionsShown: false,
      OPTIONS_FROM_SERVER: [],
      OPTIONS_LIMIT: [],
      isLoading: false,
      inputSearch: this.propInput[this.trackBy] || "",
      selectedOption: this.propInput || false,
    };
  },
  watch: {
    cashedInput: debounce(async function() {
      if (this.DEFAULT_OPTIONS.length === 0 && this.cashedInput !== null) {
        this.isLoading = true;
        const response = await this.makeRequestToDB(this.inputSearch);
        this.OPTIONS_FROM_SERVER = response;
        this.isLoading = false;
      } else if (!this.DEFAULT_OPTIONS.includes(this.inputSearch)) {
        this.OPTIONS_FROM_SERVER = [];
      }
    }, 500),
  },
  computed: {
    DEFAULT_OPTIONS() {
      if (this.cashedInput) {
        return this.options.filter((option) => {
          if (typeof option[this.optionIdName] === "string") {
            return option[this.optionIdName].includes(
              this.cashedInput.toString()
            );
          }
          if (typeof option[this.optionIdName] === "number") {
            const arrayOfNumbers = option[this.optionIdName]
              .toString()
              .split("");
            return arrayOfNumbers.includes(this.cashedInput);
          }
        });
      }
      return this.options;
    },
    isOptionSelected() {
      return !!Object.keys(this.selectedOption).length;
    },
    showLoader() {
      return this.isLoading && this.cashedInput !== "";
    },
    cashedInput() {
      if (this.inputSearch === "") {
        return null;
      }
      return this.inputSearch;
    },
    placeholderInput() {
      return !this.isOptionSelected ? this.placeholder : "";
    },
    isNoOption() {
      return (
        !this.isLoading &&
        !this.OPTIONS_FROM_SERVER.length &&
        !this.DEFAULT_OPTIONS.length
      );
    },
  },
  methods: {
    showOptions() {
      this.isOptionsShown = true;
      this.handleFocus();
    },
    handleSelectOption(option) {
      this.inputSearch = "";
      this.isOptionsShown = false;
      if (
        this.selectedOption[this.optionIdName] === option[this.optionIdName]
      ) {
        this.selectedOption = false;
        return;
      }
      this.selectedOption = option;
      this.$emit("select", this.selectedOption);
    },
    handleFocus() {
      this.$refs.control.classList.add("focused");
    },
    handleBlur() {
      this.$refs.control.classList.remove("focused");
    },
    handleClear() {
      if (this.selectedOption) {
        this.selectedOption = false;
        this.inputSearch = "";
      }
    },
    deleteTag() {
      this.selectedOption = false;
    },
    /**
     * @param {string} searchQuery - строка поиска
     * @returns {Promise<array>} - массив объектов
     */
    async makeRequestToDB(searchQuery) {
      const response = await this.asyncFunction(searchQuery);
      return response;
    },
    clickOutside(e) {
      if (!this.$el.contains(e.target)) {
        if (this.isOptionsShown) {
          this.isOptionsShown = false;
          if (!this.isOptionSelected) {
            this.inputSearch = "";
          }
        }
      }
    },
  },
  created() {
    document.addEventListener("click", this.clickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.clickOutside);
  },
  async mounted() {
    const response = await this.makeRequestToDB("");
    this.OPTIONS_LIMIT = response;
  },
};
</script>

<style lang="scss" scoped>
ul {
  padding: 0;
  margin: 0;
  & li {
    list-style-type: none;
  }
}
.select__container {
  display: flex;
  flex-flow: column nowrap;
  max-width: 100%;
  position: relative;
  & * {
    box-sizing: border-box !important;
  }
}
.select__list-container-wrapper {
  position: relative;
}
.select__option {
  display: flex;
  position: relative;
  height: 35px;
  border: 1px solid rgba(130, 130, 130, 0.08);
  border-top: 0px solid rgba(130, 130, 130, 0.08);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-family: sans-serif;
  line-height: 1.25;
  color: #7f8a9b !important;

  &.select__option_clickable:hover {
    background-color: rgba(130, 130, 130, 0.04);
    cursor: pointer;
    &.selected {
      background-color: rgba(130, 130, 130, 0.14);
    }
  }
  &.select__option_clickable:active {
    background-color: rgba(130, 130, 130, 0.2);
  }
  &.select__option_clickable.selected {
    background-color: rgba(130, 130, 130, 0.08);
  }
}
.select__control {
  display: flex;
  flex-flow: row wrap;
  position: relative;
  padding: 0.5rem 2rem 0 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25;
  min-height: 41.5px;
  background-color: #fff;
  background-image: none;
  background-clip: padding-box;
  border: 1px solid rgba(130, 130, 130, 0.15);
  border-radius: 0;
  color: #7f8a9b !important;
  touch-action: manipulation;
  overflow: visible;
  font-family: sans-serif;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  &.focused {
    background-color: #fff;
    border-color: #8ad4ee !important;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  &.disabled {
    background-color: #e0e0e0;
  }
  .rotated {
    transform: rotate(90deg);
    transition: transform 200ms ease-in;
  }
  .arrow {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    padding: 0.75rem;
    transition: transform 150ms ease-in;
    &::before {
      position: relative;
      right: 0;
      top: 65%;
      color: #999;
      margin-bottom: 8px;
      border-style: solid;
      border-width: 6px 6px;
      border-color: #999 transparent transparent;
      content: "";
    }
  }
}
.select__tag {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-right: 4px;
  margin-bottom: 0.5rem;
  padding: 3px 6px;
  border-radius: 6px;
  background-color: rgba(130, 130, 130, 0.15);
  min-width: 75px;

  .select__delete {
    display: block;
    margin-left: 3px;
    width: 18px;
    padding: 0 4px;
    border-radius: 2px;
    cursor: pointer;
    transition: all 200ms ease-in;

    &:hover {
      background-color: rgba(130, 130, 130, 0.15);
      transition: all 200ms ease-in;
    }
  }
}
.select__input {
  border: none;
  flex-grow: 1;
  width: 50px;
  margin-bottom: 0.5rem;
}
.select__list-container {
  max-height: 400px;
  overflow-y: auto;
  position: absolute;
  background-color: #fff;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999 !important;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
}
</style>
