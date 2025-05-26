export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category_id: string | null
          available: boolean
          featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category_id?: string | null
          available?: boolean
          featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category_id?: string | null
          available?: boolean
          featured?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_item_options: {
        Row: {
          id: string
          menu_item_id: string
          name: string
          description: string | null
          price_adjustment: number
          is_required: boolean
          created_at: string
        }
        Insert: {
          id?: string
          menu_item_id: string
          name: string
          description?: string | null
          price_adjustment?: number
          is_required?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          menu_item_id?: string
          name?: string
          description?: string | null
          price_adjustment?: number
          is_required?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_options_menu_item_id_fkey"
            columns: ["menu_item_id"]
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_item_addons: {
        Row: {
          id: string
          menu_item_id: string
          name: string
          description: string | null
          price_adjustment: number
          is_required: boolean
          created_at: string
        }
        Insert: {
          id?: string
          menu_item_id: string
          name: string
          description?: string | null
          price_adjustment?: number
          is_required?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          menu_item_id?: string
          name?: string
          description?: string | null
          price_adjustment?: number
          is_required?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_addons_menu_item_id_fkey"
            columns: ["menu_item_id"]
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          }
        ]
      }
      meal_options: {
        Row: {
          id: string
          menu_item_id: string
          name: string
          description: string | null
          price_adjustment: number
          created_at: string
        }
        Insert: {
          id?: string
          menu_item_id: string
          name: string
          description?: string | null
          price_adjustment?: number
          created_at?: string
        }
        Update: {
          id?: string
          menu_item_id?: string
          name?: string
          description?: string | null
          price_adjustment?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_options_menu_item_id_fkey"
            columns: ["menu_item_id"]
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string | null
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id?: string | null
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string | null
          quantity?: number
          price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          total: number
          delivery_address: string | null
          delivery_fee: number
          phone: string | null
          payment_intent_id: string | null
          payment_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          total: number
          delivery_address?: string | null
          delivery_fee?: number
          phone?: string | null
          payment_intent_id?: string | null
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total?: number
          delivery_address?: string | null
          delivery_fee?: number
          phone?: string | null
          payment_intent_id?: string | null
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      discounts: {
        Row: {
          id: string
          name: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_item_discounts: {
        Row: {
          menu_item_id: string
          discount_id: string
          created_at: string
        }
        Insert: {
          menu_item_id: string
          discount_id: string
          created_at?: string
        }
        Update: {
          menu_item_id?: string
          discount_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_discounts_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_discounts_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          }
        ]
      }
      category_discounts: {
        Row: {
          category_id: string
          discount_id: string
          created_at: string
        }
        Insert: {
          category_id: string
          discount_id: string
          created_at?: string
        }
        Update: {
          category_id?: string
          discount_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_discounts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_discounts_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}