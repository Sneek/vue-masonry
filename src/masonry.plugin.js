import Masonry from 'masonry-layout'
import ImageLoaded from 'imagesloaded'

const attributesMap = {
  'column-width': 'columnWidth',
  'transition-duration': 'transitionDuration',
  'item-selector': 'itemSelector',
  'origin-left': 'originLeft',
  'origin-top': 'originTop',
  'fit-width': 'fitWidth',
  'stamp': 'stamp',
  'gutter': 'gutter',
  'percent-position': 'percentPosition'
}
const EVENT_ADD = 'vuemasonry.itemAdded'
const EVENT_REMOVE = 'vuemasonry.itemRemoved'
const EVENT_IMAGE_LOADED = 'vuemasonry.imageLoaded'
const EVENT_DESTROY = 'vuemasonry.destroy'

const stringToBool = function (val) { return (val + '').toLowerCase() === 'true' }

const collectOptions = function (attrs) {
  var res = {}
  var attributesArray = Array.prototype.slice.call(attrs)
  attributesArray.forEach(function (attr) {
    if (Object.keys(attributesMap).indexOf(attr.name) > -1) {
      res[attributesMap[attr.name]] = (attr.name.indexOf('origin') > -1) ? stringToBool(attr.value) : attr.value
    }
  })
  return res
}
export const VueMasonryPlugin = function () {}

VueMasonryPlugin.install = function (Vue, options) {
  VueMasonryPlugin.Events = new Vue({});

  Vue.directive('masonry', {
    props: ['transitionDuration', ' itemSelector'],

    inserted: function (el, nodeObj) {
      if (!Masonry) {
        throw new Error('Masonry plugin is not defined. Please check it\'s connected and parsed correctly.')
      }
      const masonry = new Masonry(el, collectOptions(el.attributes))
      const masonryDraw = function () {
        masonry.reloadItems()
        masonry.layout()
      }
      Vue.nextTick(function () {
        masonryDraw()
      })

      VueMasonryPlugin.Events.$on(EVENT_ADD, function (eventData) {
        masonryDraw()
      })
      VueMasonryPlugin.Events.$on(EVENT_REMOVE, function (eventData) {
        masonryDraw()
      })
      VueMasonryPlugin.Events.$on(EVENT_IMAGE_LOADED, function (eventData) {
        masonryDraw()
      })
      VueMasonryPlugin.Events.$on(EVENT_DESTROY, function (eventData) {
        masonry.destroy()
      })
    },
    unbind: function (el, nodeObj) {
      VueMasonryPlugin.Events.$emit(EVENT_DESTROY)
    }
  })

  Vue.directive('masonryTile', {

    inserted: function (el) {
      VueMasonryPlugin.Events.$emit(EVENT_ADD, {
        'element': el
      })
      // eslint-disable-next-line
      new ImageLoaded(el, function () {
        VueMasonryPlugin.Events.$emit(EVENT_IMAGE_LOADED, {
          'element': el
        })
      })
    },
    beforeDestroy: function (el) {
      VueMasonryPlugin.Events.$emit(EVENT_REMOVE, {
        'element': el
      })
    }
  })

  Vue.prototype.$redrawVueMasonry = function () {
    VueMasonryPlugin.Events.$emit(EVENT_ADD)
  }
}
