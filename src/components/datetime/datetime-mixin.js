import { between } from '../../utils/format'
import { inline as props } from './datetime-props'
import {
  convertDateToFormat,
  getDateBetween,
  inferDateFormat,
  startOfDate,
  isSameDate,
  isValid
} from '../../utils/date'

const reDate = /^\d{4}[^\d]\d{2}[^\d]\d{2}/

export default {
  props,
  computed: {
    computedValue () {
      if (this.type === 'date' && this.formatModel === 'string' && reDate.test(this.value)) {
        return this.value.slice(0, 10).split(/[^\d]/).join('/')
      }
      return this.value
    },
    computedDefaultValue () {
      if (this.type === 'date' && this.formatModel === 'string' && reDate.test(this.defaultValue)) {
        return this.defaultValue.slice(0, 10).split(/[^\d]+/).join('/')
      }
      return this.defaultValue
    },
    computedDateFormat () {
      if (this.type === 'date' && this.formatModel === 'string') {
        return 'YYYY/MM/DD HH:mm:ss'
      }
    },
    model: {
      get () {
        let date = isValid(this.computedValue)
          ? new Date(this.computedValue)
          : (this.computedDefaultValue ? new Date(this.computedDefaultValue) : startOfDate(new Date(), 'day'))

        return getDateBetween(
          date,
          this.pmin,
          this.pmax
        )
      },
      set (val) {
        const date = getDateBetween(val, this.pmin, this.pmax)
        const value = convertDateToFormat(date, this.formatModel === 'auto' ? inferDateFormat(this.value) : this.formatModel, this.computedDateFormat)
        this.$emit('input', value)
        this.$nextTick(() => {
          if (!isSameDate(value, this.value)) {
            this.$emit('change', value)
          }
        })
      }
    },
    pmin () {
      return this.min ? new Date(this.min) : null
    },
    pmax () {
      return this.max ? new Date(this.max) : null
    },
    typeHasDate () {
      return this.type === 'date' || this.type === 'datetime'
    },
    typeHasTime () {
      return this.type === 'time' || this.type === 'datetime'
    },

    year () {
      return this.model.getFullYear()
    },
    month () {
      return this.model.getMonth() + 1
    },
    day () {
      return this.model.getDate()
    },
    minute () {
      return this.model.getMinutes()
    },

    currentYear () {
      return (new Date()).getFullYear()
    },

    yearInterval () {
      let
        min = this.yearMin,
        max = this.pmax !== null ? this.pmax.getFullYear() : (this.year || this.currentYear) + 50
      return Math.max(1, max - min)
    },
    yearMin () {
      return this.pmin !== null ? this.pmin.getFullYear() - 1 : (this.year || this.currentYear) - 51
    },
    monthInterval () {
      let
        min = this.monthMin,
        max = this.pmax !== null && this.pmax.getFullYear() === this.year ? this.pmax.getMonth() : 11
      return Math.max(1, max - min + 1)
    },
    monthMin () {
      return this.pmin !== null && this.pmin.getFullYear() === this.year
        ? this.pmin.getMonth()
        : 0
    },

    daysInMonth () {
      return (new Date(this.year, this.model.getMonth() + 1, 0)).getDate()
    },

    editable () {
      return !this.disable && !this.readonly
    }
  },

  methods: {
    toggleAmPm () {
      if (!this.editable) {
        return
      }
      let
        hour = this.model.getHours(),
        offset = this.am ? 12 : -12

      this.model = new Date(this.model.setHours(hour + offset))
    },

    __parseTypeValue (type, value) {
      if (type === 'month') {
        return between(value, 1, 12)
      }
      if (type === 'date') {
        return between(value, 1, this.daysInMonth)
      }
      if (type === 'year') {
        let
          min = this.yearMin,
          max = min + this.yearInterval
        return between(value, min + 1, max)
      }
      if (type === 'hour') {
        return between(value, 0, 23)
      }
      if (type === 'minute') {
        return between(value, 0, 59)
      }
    }
  }
}
