<template>
  <div class="card card-user">
    <div class="image">
      <img src="/static/img/background/damir-bosnjak.jpg" alt="...">
    </div>
    <div class="card-body">
      <div class="author">
        <a href="#">
          <img class="avatar border-gray" src="/static/img/logo.png" alt="...">
          <h5 class="title">{{ userDetail.name }}</h5>
        </a>
        <p class="description">
          @myfridge
        </p>
      </div>
      <p class="description text-center">
        公司名言： "中國特色社會主義不是從天上掉下來的，
        <br> 是黨和人民歷盡千辛萬苦、
        <br> 付出巨大代價取得的根本成就。"
      </p>
    </div>
    <div class="card-footer">
      <hr>
      <div class="button-container">
        <div class="row">
          <div class="col-lg-3 col-md-6 col-6 ml-auto">
            <h5>第1
              <br>
              <small>凍肉品牌</small>
            </h5>
          </div>
          <div class="col-lg-4 col-md-6 col-6 ml-auto mr-auto">
            <h5>第2
              <br>
              <small>世界經濟體</small>
            </h5>
          </div>
          <div class="col-lg-3 mr-auto">
            <h5>14億
              <br>
              <small>中國人</small>
            </h5>
          </div>
        </div>
      </div>
      <hr>
      <div class="card-body">
        <h4 class="title">MyFridge 團隊</h4>
        <ul class="list-unstyled team-members">
          <li>
            <div class="row" v-for="member in members">
              <div class="col-2 col-md-2">
                <div class="avatar">
                  <img :src="member.image" width="30" height="30" alt="Circle Image" class="img-circle img-no-padding img-responsive">
                </div>
              </div>
              <div class="col-md-7 col-7">
                {{ member.name }}
                <br>
                <span :class="getStatusClass(member.status)">
                <small>{{ member.status }}</small>
              </span>
              </div>

              <div class="col-md-3 col-3 text-right">
                <p-button size="sm" type="success" outline icon round>
                  <i class="fa fa-envelope"></i>
                </p-button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props   : ['userDetail'],
  methods : {
    getStatusClass (status) {
      switch (status) {
        case 'Offline':
          return 'text-muted'
        case 'Available':
          return 'text-success'
        case 'Busy':
          return 'text-danger'
        default:
          return 'text-success'
      }
    }
  },
  data () {
    return {
      members : [
        {
          image  : '/static/img/faces/face-0.jpg',
          name   : '創辦人東哥',
          status : 'Available'
        },
      ]
    }
  },
}

</script>
<style>

</style>
