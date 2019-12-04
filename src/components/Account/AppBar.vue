<template>
    <v-layout :style="{background: primaryColor, width:'240px'}" column fill-height>
        <v-flex shrink :class="{selected_color: selected_index == index}" @click="changeIndex(index)"
            class="pointer"  v-for="(obj,index) in items" :key="index" >
            <v-layout class="pa-4" row>
                <v-flex shrink class="mr-2"><v-icon color="white" >{{obj.icon}}</v-icon></v-flex>
                <v-flex shrink class="capitalize bold align_center" style="color:white">{{obj.title}}</v-flex>
            </v-layout>
        </v-flex>
    </v-layout> 
</template>

<script>
export default {
    data(){
        return {
            selected_index: 0,
            items: [
                { icon: "home", title: "Pending Orders"},
                {icon: "local_shipping", title: "Out For Delivery"},
                {icon: "refresh", title: "Previous Orders"},
                {icon: "fastfood", title: "Inventory"},
                {icon: "notifications", title: "Notifications"},
                {icon: "notifications", title: "Offers"},
            ]
        }
    },

    computed:{
        primaryColor(){
            return this.$store.getters.getPrimaryColor
        }
    },

    methods:{
        changeIndex(index){
            this.selected_index = index
            this.$emit("indexChanged", index)
        }
    }
}
</script>

