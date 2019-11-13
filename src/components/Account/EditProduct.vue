<template>
    <v-card v-if="dialog" class="pa-4 card">
        <v-layout column>
            <v-flex shrink class="x_large bold mt-4">Edit Product</v-flex>
            <hr class="mt-3 mb-2">

            <v-flex><v-text-field label="Name" v-model="edited_product.name"></v-text-field></v-flex>
            <v-flex><v-select :items="catg_units" v-model="edited_product.category" label="Category"></v-select></v-flex>
            <v-flex>
                <v-layout row>
                    <v-flex><v-text-field label="Rate" v-model="edited_product.price_per_qty"></v-text-field></v-flex>
                    <v-flex>/</v-flex>
                    <v-flex><v-text-field label="Qty" v-model="edited_product.per"></v-text-field></v-flex>
                    <v-flex><v-select :items="units" v-model="edited_product.unit" label="Unit"></v-select></v-flex>
                </v-layout>
            </v-flex>
            <v-flex><v-textarea label="Description" v-model="edited_product.desc"></v-textarea></v-flex>
            <v-flex><v-btn @click="save()" dark block color="rgb(0, 133, 119)" class="capitalize bold">Save</v-btn></v-flex>
        </v-layout>
    </v-card>
</template>

<script>
import firebase from "firebase"
import { storeDb } from '../firebase/init'

export default {
    props : ["product","dialog"],

    data(){
        return{
            edited_product:null,
            units: ["KG", "GM", "L","ML", "Pc"],
            catg_units: ["VEG","NONVEG"]
        }
    },

    methods: {
        async save(){
            this.correctFields();
            await this.updateOnBackend();  
            this.$emit("editProduct", this.edited_product)     
        },

        correctFields(){
            this.edited_product.price_per_qty = parseFloat(this.edited_product.price_per_qty)
            this.edited_product.per = parseFloat(this.edited_product.per)
        },

        async updateOnBackend(){
            let uid = await firebase.auth().currentUser.uid;
            let ref = `Vendors/${uid}/products`
            await storeDb.collection(ref).doc(this.edited_product.id.toString())
            .update(this.edited_product)
        }
    },

    watch:{
        dialog(val){
            if (val) {
                this.edited_product = JSON.parse(JSON.stringify(this.product))
                console.log("edited", this.edited_product);
                
            }
        }
    }
}
</script>