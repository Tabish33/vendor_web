<template>
    <v-layout fill-height column>
        <v-flex shrink>
            <v-layout column>
                <v-card flat>
                    <v-flex>
                        <v-layout>
                            <v-flex class="x_large bold mt-4">Inventory</v-flex>
                        </v-layout>
                    </v-flex>
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
                                            <v-flex @click="showDeleteProductDialog(product)" class="pointer" shrink><v-icon color="warning">delete</v-icon></v-flex>
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
        <!-- ADD ITEM -->
        <v-flex style="position:fixed;right:15px;bottom:15px;z-index:30">
            <v-btn @click="add_product_dialog = true" large fab dark color="warning">
                <v-icon dark>add</v-icon>
            </v-btn>
        </v-flex>
        <!-- DIALOGS -->
        <v-flex v-show="false">
            <v-dialog persistent width="400" v-model="edit_product_dialog">
                <edit-product v-on:exit="edit_product_dialog =false" :product="selected_product" :dialog="edit_product_dialog" v-on:editProduct="editProduct($event)"></edit-product>
            </v-dialog>

            <v-dialog persistent width="400" v-model="add_product_dialog">
                <add-product v-on:exit="add_product_dialog=false"  v-on:addProduct="addProduct($event)" ></add-product>
            </v-dialog>

            <v-dialog v-model="confirm_deletion_dialog" width="400">
                <v-card class="pa-4 card">
                    <v-flex shrink class="x_large bold">Delete Item<v-icon>delete</v-icon> </v-flex>
                    <hr class="mt-3 mb-2">
                    <v-flex class="bold mt-2 mb-2" style="color:grey">Are you sure you want to delete this item?</v-flex>
                    <v-flex>
                        <v-layout>
                            <v-spacer></v-spacer>
                            <v-flex shrink><v-btn @click="deleteOrder()" dark color="rgb(0, 133, 119)">Yes</v-btn></v-flex>
                            <v-flex shrink><v-btn @click="confirm_deletion_dialog= false" dark color="warning">No</v-btn></v-flex>
                        </v-layout>
                    </v-flex>
                </v-card>
            </v-dialog>

            <loading :dialog="loading_dialog"></loading>
        </v-flex>
    </v-layout>
</template>

<script>
import firebase from "firebase"
import { storeDb } from '../firebase/init'
const EditProduct = () => import("./EditProduct")
const AddProduct = () => import("./AddProduct")
const CreateOffer = () => import("./CreateOffer")
import Loading from "./Loading"


export default {
    components:{
        "edit-product": EditProduct,
        "add-product": AddProduct,
        "offers": CreateOffer,
        "loading": Loading
    },

    data(){
        return {
            inventory: [],
            selected_product: null,
            edit_product_dialog: false,
            add_product_dialog: false,
            show_offers_dialog: false,
            confirm_deletion_dialog: false,
            loading_dialog: false
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

        showDeleteProductDialog(product){
            this.selected_product = product
            this.confirm_deletion_dialog = true
        },

        async deleteOrder(){
            this.loading_dialog = true;

            let order = this.selected_product
            let ref = "Vendors/ZNtVs6nMyeMn2CbEdy6vB1riZ4s1/products";
            await this.$store.dispatch("deleteFromDb",{ref, "id":order.id.toString()})
            for (let i = 0; i < this.inventory.length; i++) {
                let product = this.inventory[i];
                if (product.id == order.id) {
                    this.inventory.splice(i, 1)
                    break;
                }    
            }
            
            this.loading_dialog  = false;
            this.confirm_deletion_dialog = false
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
        },
        
        addProduct(new_product){
            this.inventory.splice(0, 0, new_product);
            this.add_product_dialog = false
        }
    },

    created(){
        this.getInventory()
    }
}
</script>