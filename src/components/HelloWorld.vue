<template>
  <div class="hello">
    <div class="d-flex flex-row header bg-dark">    
      <div>
        <div class="welcome-holder">
          <h2>Welcome to Autozip</h2>
          <font-awesome-icon icon="fa-solid fa-paperclip"  inverse/>
        </div>
        
        
        <p>Built by NETRUNNER</p>
        <button class="btn btn-success" @click="openFileSearch">Select Files</button>
        <p>Last save output at: </p> <p class="green">{{lastSaveTime}}</p>
      </div>

      <div>
        <p>Student Number: {{dispNumber}}</p>

       <div class="input-group mb-3">
  <input type="text" class="form-control" placeholder="Enter Student Number" aria-label="Recipient's username" aria-describedby="basic-addon2" v-model="studentNumber" @input="input">
  <div class="input-group-append">
    <button style="padding: 5px" class="btn btn-outline-secondary" type="button" @click="updatedStudentNumber">Update</button>
  </div>

      </div>

          <p>Output Directory:</p>
          <p>{{disp}}</p>
        <div class="input-group mb-3">
                <div style="min-width: 100%;">
                    <button class="btn btn-info" type="button" @click="openFileExplore">Select Output Directory</button>
                </div>
        </div>

      </div>

    </div>

    <div style="align-items: center;">
      <div class="tb-header">
            <div style="width:30%; text-align: left;"><p>File Name</p></div>
            <div style="width:50%; text-align: left;"> <p>Filepath</p></div>
            <div style="width:10%; text-align: left;"><p>Status</p></div>
            <div style="width:10%; text-align: left;"><p>Delete</p></div>
      </div>
      <div class="row-holder">
          <TableRow v-for="item in items" :key="item" v-bind:item="item"></TableRow>
      </div>
    </div>
  </div>
  
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css';
import './TableRow.vue'
import {ipcRenderer} from 'electron'
import TableRow from './TableRow.vue'
export default {
    name: "HelloWorld",
    data() {
        return {
            items: [],
            studentNumber: "",
            dispNumber: "",
            disp: "Not Selected",
            lastSaveTime: "[00:00:00 AM]"
        };
    },
    methods: {
        openFileSearch() {
            ipcRenderer.send("open-file-search");
        },
        input(e) {
            this.studentNumber = e.target.value;
        },
        openFileExplore() {
            ipcRenderer.send("open-file-explore");
        },
        updatedStudentNumber(){
           ipcRenderer.send("student-number-updated", this.studentNumber);
           this.dispNumber = this.studentNumber;
        }
    },
    mounted(){
      ipcRenderer.send("readSettings");
    },
    created() {
        ipcRenderer.on("on-files-updated", (event, args) => {
            this.items = args;
        }),
        ipcRenderer.on("on-output-dir", (event, args) => {
                this.disp = args[0];
        });
        ipcRenderer.on("on-settings-read", (event, args)=>{
          this.dispNumber = args[0]; 
          this.disp = args[1];
        }),
        ipcRenderer.on("zip-created", ()=>{
          //update last save time
          let current = new Date()
          const time = current.toLocaleTimeString();
          this.lastSaveTime = time;
        })
    },
    components: { TableRow }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.btn-danger{
  min-width: 50px !important  ;
}

.welcome-holder{
  display: flex;
  flex-direction: row;
}
.tb-header{
  min-width: 100%;
  display: flex !important;
  flex-direction: row;
  background-color: rgb(77, 149, 232);
  min-height: 55px;
  padding: 10px;
  margin-bottom: 10px;
  overflow-y:none;
}
.btn-success{
  margin-top: 30px;
  min-height: 30px;
  min-width: 100%;
  margin-bottom: 25px
}
.btn-info{
  min-width: 100%;
  min-height: 35px;
}
.input-group{
  max-height: 40px;
  max-width: 300px; 
  margin-top: 20px;
}
.header{
  margin-bottom: 10px;
  background-color: rgba(0, 0, 0, 0.2) !important;
  padding: 30px;
  justify-content: space-between;
  background-color: rgb(43, 43, 43) !important;
}
.green{
  color: rgb(65, 213, 65);
}
body{
  background-color: rgb(34, 34, 34);
}
h1,h2,p{
  color: white;
}
p{
  padding: 0;
  margin: 0px;
  font-size: 14px;
}
*{
  margin: 0;
  padding: 0;
}
</style>
