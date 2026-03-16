import {Line}             from 'vue-chartjs'
import reactiveChartMixin from './mixins/reactiveChart';
import {hexToRGB}         from "./utils";

const chartColor = "#FFFFFF";
const gradientChartOptionsConfiguration = {

  legend : {
    display : true,
  },

  tooltips : {
    enabled       : true,
    displayColors : true,
    borderWidth   : 5,
    caretPadding  : 10,
  },

  scales : {
    yAxes : [{
      gridLines : {
        drawBorder    : true,
        zeroLineColor : "#ddd",
        color         : '#eef',
        display       : true,
      },
      ticks     : {
        // Abbreviate the millions
        callback : function (value, index, values) {
          return value / 1e6 + 'M';
        }
      }
    }],

    xAxes : [{
      barPercentage : 1.6,
      gridLines     : {
        drawBorder    : true,
        zeroLineColor : "#ddd",
        color         : '#eef ',
        display       : true,
      },
    }]
  },
};

export default {
  name    : 'line-chart',
  extends : Line,
  mixins  : [reactiveChartMixin],
  props   : {
    labels       : {
      type        : [Object, Array],
      description : 'Chart labels. This is overridden when `data` is provided'
    },
    datasets     : {
      type        : [Object, Array],
      description : 'Chart datasets. This is overridden when `data` is provided'
    },
    data         : {
      type        : [Object, Array],
      description : 'Chart.js chart data (overrides all default data)'
    },
    color        : {
      type        : String,
      description : 'Chart color. This is overridden when `data` is provided'
    },
    extraOptions : {
      type        : Object,
      description : 'Chart.js options'
    },
    title        : {
      type        : String,
      description : 'Chart title'
    },
  },
  methods : {
    assignChartData ({ data }) {
      let color = this.color || this.fallBackColor;
      return {
        labels   : this.labels || [],
        datasets : this.datasets ? this.datasets : [{
          label            : this.title || '',
          borderColor      : color,
          pointRadius      : 2,
          pointHoverRadius : 5,
          fill             : false,
          borderWidth      : 3,
          data             : this.data || data
        }]
      }
    },
    assignChartOptions (initialConfig) {
      let color = this.color || this.fallBackColor;
      const ctx = document.getElementById(this.chartId).getContext('2d');
      const gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
      gradientStroke.addColorStop(0, color);
      gradientStroke.addColorStop(1, chartColor);

      const gradientFill = ctx.createLinearGradient(0, 170, 0, 50);
      gradientFill.addColorStop(0, "rgba(128, 182, 244, 0)");
      gradientFill.addColorStop(1, hexToRGB(color, 0.4));

      let extraOptions = this.extraOptions || {}
      return {
        ...initialConfig,
        ...extraOptions
      };
    }
  },
  mounted () {
    this.chartData = this.assignChartData({});
    this.options = this.assignChartOptions(gradientChartOptionsConfiguration);
    this.renderChart(this.chartData, this.options);
  }
}
