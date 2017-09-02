<template>
  <div>
    <table class="tbl">
      <colgroup>
        <col span="1" style="width: 20%;">
        <col span="1" style="width: 70%;">
      </colgroup>
      <tbody>
        <tr>
          <td>Age</td>
          <td>
            <div class="slide">
              <input class="sclass" type="range" v-model="age"><br>
              <div class="smin">18</div>
              <div class="smax">100</div>
            </div>
          </td>
        </tr>
        <tr>
          <td>Wealth</td>
          <td>
            <div class="slide">
              <datalist id="wlth">
                <option>0</option>
                <option>20</option>
                <option>40</option>
                <option>60</option>
                <option>80</option>
                <option>100</option>
              </datalist>
              <input class="sclass" type="range" v-model="wealth" list="wlth"><br>
              <div>
                <div class="smin">$0</div>
                <div class="smid">$1000</div>
                <div class="smid">$10,000</div>
                <div class="smid">$100,000</div>
                <div class="smid">$1 Million</div>
                <div class="smax">$10 Million</div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>Social</td>
          <td>
            <div class="slide">
              <input class="sclass" type="range" v-model="social"><br>
              <div class="smin">Alt-Left</div>
              <div class="smax">Alt-Right</div>
            </div>
          </td>
        </tr>
        <tr>
          <td>Fiscal</td>
          <td>
            <div class="slide">
              <input class="sclass" type="range" v-model="fiscal"><br>
              <div class="smin">Communist</div>
              <div class="smax">Libertarian</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
// import Rpc from './Rpc'

export default {
  name: 'RegOptions',
  props: {

  },
  data () {
    return {
      age: -1,
      wealth: -1,
      social: -1,
      fiscal: -1
    }
  },
  created () {

  }
}
</script>
<style scoped>
.tbl {
  width: 65%;
}
.slide {
  display: inline-block;
  width: 100%;
}

.opt {}

.smid {
  display: inline-block;
  font-size: .7em;
  width: 18%;
  position: relative;
  top: -10px;
}

.smin {
  text-align: left;
  display: inline-block;
  float: left;
  font-size: .7em;
  position: relative;
  top: -5px;
}

.smax {
  display: inline-block;
  float: right;
  font-size: .7em;
  position: relative;
  top: -5px;
  right: 0px;
  text-align: right;
}

.sclass {
  display: inline-block;
  position: relative;
  margin-top: 0px;
  width: 95%;
}

.btns {
  width: 20%;
  margin: 10%;
}

.btndiv {
  width: 100%;
}

.slist {
  margin-top: 0px;
  margin-left: 1em;
  float: left;
  text-align: left;
}
.usertype {
  display: block;
  float: left;
  width: 100%;
  text-align: left;
}
.uhead {
  font-weight: bold;
  text-align: left;
  float: left;
  margin-right: 2em;
}
</style>
