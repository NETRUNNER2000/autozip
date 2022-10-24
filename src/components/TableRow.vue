<template>
    <div class="row-holder">
            <div style="width:30%; text-align: left;"><p>{{item.substring(item.lastIndexOf('\\')+1,item.length)}}</p></div>
            <div style="width:50%; text-align: left;"> <p>{{item}}</p></div>
            <div style="width:10%; text-align: left;"><p>Tracked</p></div>
            
            <div class="btn-holder" style="width:10%; text-align: center;">
                <Button @click="removeItem" class="btn btn-danger">
                <font-awesome-icon icon="fa-solid fa-trash" />
                </Button>
            </div>
    </div>
</template>

<script>

import 'bootstrap/dist/css/bootstrap.min.css';
import {ipcRenderer} from 'electron'
export default {
    props: {
    item: String
  },
  methods: {
    removeItem() {
            console.log('Item about to be removed')
            ipcRenderer.send("delete-file-watcher", this.item);
            this.$el.parentNode.removeChild(this.$el);
        }
    }
}
</script>

<style scoped>
.row-holder{
    min-width: 100%;
    display: flex !important;
    flex-direction: row;
    border-style: solid;
    border-width: 1px;
    border-color: rgb(59, 59, 59);
    padding: 10px;
    background-color: rgb(43, 43, 43);
    justify-content: center;
    align-items: center;
}
.row-holder div{

}
p{
    word-wrap: normal;
    color: white;
}
.btn{
    max-height: 100%;
}

.btn-holder{
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 20px;
}
</style>