<template>
  <div class="home">
    <div class="table">
      <div class="cell">
        <h2>
          홈페이지
        </h2>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Home',
}
</script>

<style scoped>
  .home {
    height: 100%;
  }
  .table {
    width: 100%;
    height: 100%;
    text-align: center;
    display: table;
  }
  .cell {
    display: table-cell;
    vertical-align: middle;
  }
</style>
