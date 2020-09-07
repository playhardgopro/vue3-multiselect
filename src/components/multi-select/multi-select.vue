<template>
  <div class="multi-select__container">
    <div
      ref="control"
      class="multi-select__control"
      :class="{ disabled: disabled }"
      :style="{
        'border-bottom-right-radius': isOptionsShown ? '0' : '',
        'border-bottom-left-radius': isOptionsShown ? '0' : '',
      }"
      @click="showOptions"
    >
      <div
        v-for="option of selectedOptions"
        :key="option[optionIdName]"
        class="multi-select__tag"
      >
        <span class="multi-select__tag-text">{{ option[trackBy] }}</span>
        <span
          v-if="!disabled"
          class="multi-select__delete"
          @click="deleteTag(option)"
        >
          <svg viewBox="0 0 492 492">
            <path
              fill="currentColor"
              d="M300.188,246L484.14,62.04c5.06-5.064,7.852-11.82,7.86-19.024c0-7.208-2.792-13.972-7.86-19.028L468.02,7.872c-5.068-5.076-11.824-7.856-19.036-7.856c-7.2,0-13.956,2.78-19.024,7.856L246.008,191.82L62.048,7.872c-5.06-5.076-11.82-7.856-19.028-7.856c-7.2,0-13.96,2.78-19.02,7.856L7.872,23.988c-10.496,10.496-10.496,27.568,0,38.052L191.828,246L7.872,429.952c-5.064,5.072-7.852,11.828-7.852,19.032c0,7.204,2.788,13.96,7.852,19.028l16.124,16.116c5.06,5.072,11.824,7.856,19.02,7.856c7.208,0,13.968-2.784,19.028-7.856l183.96-183.952l183.952,183.952c5.068,5.072,11.824,7.856,19.024,7.856h0.008c7.204,0,13.96-2.784,19.028-7.856l16.12-16.116c5.06-5.064,7.852-11.824,7.852-19.028c0-7.204-2.792-13.96-7.852-19.028L300.188,246z"
            />
          </svg>
        </span>
      </div>
      <input
        type="text"
        class="multi-select__input"
        v-model="inputSearch"
        :disabled="disabled"
        :placeholder="placeholderInput"
        @blur="handleBlur"
        @focus="handleFocus"
        v-on:keydown.delete="
          cashedInput === null
            ? deleteTag(selectedOptions[selectedOptions.length - 1])
            : () => {}
        "
      />
      <div class="arrow" :class="{ rotated: !isOptionsShown }"></div>
    </div>
    <div v-show="isOptionsShown" class="multi-select__list-container-wrapper">
      <div class="multi-select__list-container">
        <span class="multi-select__option" v-show="showLoader">
          <loading
            style="position: absolute; top: 0; left: 0; right:0; bottom:0; margin: auto"
          />
        </span>

        <ul v-if="!showLoader">
          <template v-if="OPTIONS_FROM_SERVER.length">
            <li
              v-for="(option, id) of OPTIONS_FROM_SERVER"
              :key="`option-from-server-${option[optionIdName]}-${id}`"
            >
              <span
                class="multi-select__option multi-select__option_clickable"
                :class="{
                  selected: selectedOptions.some(
                    (el) => el[optionIdName] === option[optionIdName]
                  ),
                }"
                @click="handleSelectOption(option)"
              >
                {{ option[trackBy] || noSuchField }}
              </span>
            </li>
          </template>
          <template v-if="!OPTIONS_FROM_SERVER.length && cashedInput === null">
            <li
              v-for="(option, id) of DEFAULT_OPTIONS"
              :key="`option-${option[optionIdName]}-${id}`"
            >
              <span
                class="multi-select__option multi-select__option_clickable"
                :class="{
                  selected: selectedOptions.some(
                    (el) => el[optionIdName] === option[optionIdName]
                  ),
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
                class="multi-select__option multi-select__option_clickable"
                :class="{
                  selected: selectedOptions.some(
                    (el) => el[optionIdName] === option[optionIdName]
                  ),
                }"
                @click="handleSelectOption(option)"
              >
                {{ option[trackBy] || noSuchField }}
              </span>
            </li>
          </template>
        </ul>
        <template v-if="!OPTIONS_FROM_SERVER.length && cashedInput !== null">
          <div v-show="isNoOption" class="multi-select__option">
            {{ noOptionsFound }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Loading from "../loading/loading.vue";

function isEqual(first, second) {
  return first === second;
}

function isNotEqual(first, second) {
  return first !== second;
}

function debounce(func, wait, immediate?) {
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
  name: "MultiSelectComponent",
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
    multiselect: {
      type: Boolean,
      default: false,
    },
    noOptionsFound: {
      type: String,
      default: "Not found",
    },
    propInput: {
      default: () => [],
      required: false,
    },
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
      inputSearch: "",
      selectedOptions: this.propInput || [],
    };
  },
  watch: {
    cashedInput: debounce(async function() {
      if (this.DEFAULT_OPTIONS.length === 0 && this.cashedInput !== null) {
        this.isLoading = true;
        const response = await this.makeRequestToDB(this.inputSearch);
        this.OPTIONS_FROM_SERVER = response;
        this.isLoading = false;
      } else if (!this.DEFAULT_OPTIONS.includes(this.cashedInput)) {
        this.OPTIONS_FROM_SERVER = [];
      }
    }, 500),
    "selectedOptions.length": {
      handler() {
        this.handleSelect();
      },
    },
  },
  computed: {
    DEFAULT_OPTIONS(): object[] {
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
    showLoader(): boolean {
      return this.isLoading && this.inputSearch !== "";
    },
    cashedInput(): string | null {
      if (this.inputSearch === "") {
        return null;
      }
      return this.inputSearch;
    },
    placeholderInput(): string {
      return !this.selectedOptions.length ? this.placeholder : "";
    },
    isNoOption(): boolean {
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
    handleSelectOption(selectedOption: string) {
      if (
        this.selectedOptions.some((option) =>
          isEqual(option[this.optionIdName], selectedOption[this.optionIdName])
        )
      ) {
        this.selectedOptions = this.selectedOptions.filter((option) =>
          isNotEqual(
            option[this.optionIdName],
            selectedOption[this.optionIdName]
          )
        );
      } else {
        this.selectedOptions.push(selectedOption);
      }
      // this.isOptionsShown = false;
      this.inputSearch = "";
    },
    handleFocus() {
      this.$refs.control.classList.add("focused");
    },
    handleBlur() {
      this.$refs.control.classList.remove("focused");
    },
    async makeRequestToDB(searchQuery: string) {
      const response = await this.asyncFunction(searchQuery);
      return response;
    },
    deleteTag(tag) {
      this.selectedOptions = this.selectedOptions.filter(
        (option) => option[this.optionIdName] !== tag[this.optionIdName]
      );
    },
    handleSelect() {
      this.$emit("select", this.selectedOptions);
    },
    clickOutside(e) {
      if (!this.$el.contains(e.target)) {
        if (this.isOptionsShown) {
          this.isOptionsShown = false;
          this.inputSearch = "";
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

  &:first-of-type {
    border-top: 2px solid rgba(119, 139, 235, 1);
  }
  & li {
    list-style-type: none;
  }
}
.multi-select__container {
  display: flex;
  flex-flow: column nowrap;
  max-width: 100%;
  position: relative;
  & * {
    box-sizing: border-box !important;
  }
}
.multi-select__list-container-wrapper {
  position: relative;
}
.multi-select__option {
  display: flex;
  position: relative;
  height: 35px;
  border: 1px solid rgba(130, 130, 130, 0.08);
  border-top: 0px solid rgba(84, 109, 229, 1);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-family: sans-serif;
  line-height: 1.25;
  color: rgba(48, 57, 82, 1) !important;

  &.multi-select__option_clickable:hover {
    background-color: rgba(119, 139, 235, 0.5);
    cursor: pointer;
    &.selected {
      background-color: rgba(119, 139, 235, 1);
    }
  }
  &.multi-select__option_clickable:active {
    background-color: rgba(130, 130, 130, 0.2);
  }
  &.multi-select__option_clickable.selected {
    background-color: rgba(245, 205, 121, 0.2);
  }
}
.multi-select__control {
  display: flex;
  flex-flow: row wrap;
  position: relative;
  padding: 0.5rem 2rem 0 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25;
  min-height: 41.5px;
  background-color: transparent;
  background-image: none;
  background-clip: padding-box;
  border: 2px solid rgba(84, 109, 229, 1);
  border-radius: 4px;
  color: rgba(48, 57, 82, 1) !important;
  touch-action: manipulation;
  overflow: visible;
  font-family: sans-serif;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  &.focused {
    background-color: #fff;
    border-color: rgba(119, 139, 235, 1) !important;
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
      color: rgba(48, 57, 82, 1);
      margin-bottom: 8px;
      border-style: solid;
      border-width: 6px 6px;
      border-color: rgba(48, 57, 82, 1) transparent transparent;
      content: "";
    }
  }
}
.multi-select__input {
  border: none;
  flex-grow: 1;
  width: 50px;
  margin-bottom: 0.5rem;
  &::placeholder {
    color: rgba(48, 57, 82, 1) !important;
    font-size: 0.875rem;
  }
}

.multi-select__list-container {
  max-height: 400px;
  overflow-y: auto;
  position: absolute;
  background-color: #fff;
  top: -2px;
  left: 0;
  right: 0;
  z-index: 9999 !important;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
}
.multi-select__tag {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-right: 4px;
  margin-bottom: 0.5rem;
  padding: 3px 6px;
  border-radius: 6px;
  background-color: rgba(247, 215, 148, 0.4);
  min-width: 75px;

  .multi-select__tag-text {
    margin: auto;
  }

  .multi-select__delete {
    display: block;
    margin-left: 3px;
    margin-right: -3px;
    width: 18px;
    padding: 0 4px;
    border-radius: 2px;
    cursor: pointer;
    transition: all 200ms ease-in;

    &:hover {
      background-color: rgba(247, 215, 148, 0.8);
      transition: all 200ms ease-in;
    }
  }
}
</style>
