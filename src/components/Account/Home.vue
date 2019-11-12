<template>
    <v-layout fill-height>
        <v-flex shrink>
            <app-bar v-on:indexChanged="changeSelectedIndex($event)"></app-bar>
        </v-flex>
        <v-flex class="pl-5 pt-4 pr-5">
            <dashboard v-if="selected_index == 0" ></dashboard>
        </v-flex>
    </v-layout>    
</template>

<script>
import AppBar from "./AppBar"
import DashBoard from "./DashBoard"
export default {
    data(){
        return {
            selected_index: 0,
        }
    },

    methods: {
        changeSelectedIndex(index){
            this.selected_index = index
        }
    },

    components:{
        "app-bar": AppBar,
        "dashboard": DashBoard
    }
}
</script>

