<template>
    <v-layout fill-height column>
        <v-flex shrink>
            <v-layout column>
                <v-card flat>
                    <v-flex shrink class="x_large bold mt-4">Inventory</v-flex>
                    <hr class="mt-3 mb-2">
                </v-card>
            </v-layout>
        </v-flex>
        <v-flex class="mt-2">
            <v-layout wrap>
                <v-flex md4 class="mt-2 pa-2" shrink v-for="(product,i) in inventory" :key="i">
                    <v-card class="pa-3 card" style="height:187px">
                        <v-layout>
                            <v-flex shrink><img :src="product.image_url" height="100" width="auto"></v-flex>
                            <v-flex>
                                <v-layout class="bold pa-3" column>
                                    <v-flex>
                                        <v-layout>
                                            <v-flex shrink style="color:grey">{{product.name}}</v-flex>
                                            <v-spacer></v-spacer>
                                            <v-flex @click="showEditProductDialog(product)" class="pointer" shrink><v-icon color="rgb(0, 133, 119)">edit</v-icon></v-flex>
                                        </v-layout>
                                    </v-flex>
                                    <v-flex style="color:grey">{{product.category}}</v-flex>
                                    <v-flex style="color:grey" class="mb-1">₹{{product.price_per_qty}}/{{product.per}} {{product.unit}}</v-flex>
                                    <v-flex style="color:grey;">{{product.desc.slice(0,80)}}...</v-flex>
                                </v-layout>
                            </v-flex>
                        </v-layout>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-flex>
        <!-- DIALOGS -->
        <v-flex v-show="false">
            <v-dialog width="400" v-model="edit_product_dialog">
                <edit-product :product="selected_product" :dialog="edit_product_dialog" v-on:editProduct="editProduct($event)"></edit-product>
            </v-dialog>
        </v-flex>
    </v-layout>
</template>

<script>
import firebase from "firebase"
import { storeDb } from '../firebase/init'
const EditProduct = () => import("./EditProduct")

export default {
    components:{
        "edit-product": EditProduct
    },

    data(){
        return {
            inventory: [],
            selected_product: null,
            edit_product_dialog: false
        }
    },

    methods: {
        async getInventory(){
            let uid = await firebase.auth().currentUser.uid;
            let ref = `Vendors/${uid}/products`
            let products_snap = await storeDb.collection(ref).get()

            products_snap.forEach(doc=>{
                let product = doc.data()
                this.inventory.push(product);
            })
        },

        showEditProductDialog(product){
            this.selected_product = product
            this.edit_product_dialog = true
        },

        editProduct(edited_product){
            for (let i = 0; i < this.inventory.length; i++) {
                let product = this.inventory[i];
                if (product.id == edited_product.id) {
                    this.inventory.splice(i, 1, edited_product)
                    break;
                }    
            }

            this.edit_product_dialog  = false
        }
    },

    created(){
        this.getInventory()
    }
}
</script>