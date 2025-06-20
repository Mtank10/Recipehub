import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import { 
  FaShoppingCart, 
  FaPlus, 
  FaTrash, 
  FaCheck, 
  FaTimes,
  FaEdit,
  FaList,
  FaCalendarAlt
} from 'react-icons/fa';

const GET_SHOPPING_LISTS = gql`
  query GetShoppingLists {
    getShoppingLists {
      id
      name
      isCompleted
      mealPlanId
      items {
        id
        ingredientName
        quantity
        category
        isPurchased
        notes
      }
      createdAt
    }
  }
`;

const CREATE_SHOPPING_LIST = gql`
  mutation CreateShoppingList($input: ShoppingListInput!) {
    createShoppingList(input: $input) {
      id
      name
      isCompleted
      items {
        id
        ingredientName
        quantity
        category
        isPurchased
      }
    }
  }
`;

const ADD_SHOPPING_LIST_ITEM = gql`
  mutation AddShoppingListItem($shoppingListId: ID!, $input: ShoppingListItemInput!) {
    addShoppingListItem(shoppingListId: $shoppingListId, input: $input) {
      id
      ingredientName
      quantity
      category
      isPurchased
      notes
    }
  }
`;

const UPDATE_SHOPPING_LIST_ITEM = gql`
  mutation UpdateShoppingListItem($id: ID!, $isPurchased: Boolean, $notes: String) {
    updateShoppingListItem(id: $id, isPurchased: $isPurchased, notes: $notes) {
      id
      isPurchased
      notes
    }
  }
`;

const MARK_SHOPPING_LIST_COMPLETED = gql`
  mutation MarkShoppingListCompleted($id: ID!) {
    markShoppingListCompleted(id: $id) {
      id
      isCompleted
    }
  }
`;

const ShoppingListPage = () => {
  const [selectedList, setSelectedList] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data, loading, refetch } = useQuery(GET_SHOPPING_LISTS, {
    fetchPolicy: 'cache-and-network'
  });

  const [createShoppingList] = useMutation(CREATE_SHOPPING_LIST, {
    onCompleted: () => {
      refetch();
      setShowCreateModal(false);
    }
  });

  const [addShoppingListItem] = useMutation(ADD_SHOPPING_LIST_ITEM, {
    onCompleted: () => {
      refetch();
      setShowAddItemModal(false);
    }
  });

  const [updateShoppingListItem] = useMutation(UPDATE_SHOPPING_LIST_ITEM, {
    onCompleted: () => {
      refetch();
    }
  });

  const [markShoppingListCompleted] = useMutation(MARK_SHOPPING_LIST_COMPLETED, {
    onCompleted: () => {
      refetch();
    }
  });

  const shoppingLists = data?.getShoppingLists || [];
  const activeList = selectedList || shoppingLists[0];

  const categories = ['vegetables', 'fruits', 'meat', 'dairy', 'grains', 'spices', 'other'];

  const handleCreateList = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    await createShoppingList({
      variables: {
        input: {
          name: formData.get('name')
        }
      }
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    await addShoppingListItem({
      variables: {
        shoppingListId: activeList.id,
        input: {
          ingredientName: formData.get('ingredientName'),
          quantity: formData.get('quantity'),
          category: formData.get('category'),
          notes: formData.get('notes') || ''
        }
      }
    });
  };

  const handleToggleItem = async (itemId, isPurchased) => {
    await updateShoppingListItem({
      variables: {
        id: itemId,
        isPurchased: !isPurchased
      }
    });
  };

  const handleCompleteList = async (listId) => {
    if (window.confirm('Mark this shopping list as completed?')) {
      await markShoppingListCompleted({
        variables: { id: listId }
      });
    }
  };

  const getItemsByCategory = (items) => {
    const grouped = {};
    categories.forEach(category => {
      grouped[category] = items.filter(item => item.category === category);
    });
    return grouped;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      vegetables: '🥬',
      fruits: '🍎',
      meat: '🥩',
      dairy: '🥛',
      grains: '🌾',
      spices: '🌶️',
      other: '📦'
    };
    return icons[category] || '📦';
  };

  if (loading) return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="skeleton h-8 w-48 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="skeleton h-64 rounded-xl"></div>
          <div className="lg:col-span-3 skeleton h-96 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-green)' }}>
              Shopping Lists
            </h1>
            <p className="text-sm text-gray-600">
              Organize your grocery shopping efficiently
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FaPlus />
            New List
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Shopping Lists Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl card-shadow p-4">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--primary-green)' }}>
                <FaList />
                My Lists
              </h2>
              
              <div className="space-y-2">
                {shoppingLists.map((list, index) => (
                  <motion.div
                    key={list.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      activeList?.id === list.id 
                        ? 'bg-green-50 border-2 border-green-200' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                    onClick={() => setSelectedList(list)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--dark-text)' }}>
                          {list.name}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--sage-green)' }}>
                          {list.items.length} items
                        </p>
                      </div>
                      {list.isCompleted && (
                        <FaCheck className="text-green-500 text-sm" />
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-green-500 h-1 rounded-full transition-all duration-300"
                          style={{
                            width: `${list.items.length > 0 
                              ? (list.items.filter(item => item.isPurchased).length / list.items.length) * 100 
                              : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {shoppingLists.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📝</div>
                  <p className="text-sm text-gray-600">No shopping lists yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-secondary mt-3 text-xs"
                  >
                    Create First List
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Shopping List Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {activeList ? (
              <div className="bg-white rounded-xl card-shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--primary-green)' }}>
                      {activeList.name}
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--sage-green)' }}>
                      Created {new Date(parseInt(activeList.createdAt)).toLocaleDateString()}
                      {activeList.mealPlanId && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <FaCalendarAlt className="text-xs" />
                          From meal plan
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      <FaPlus />
                      Add Item
                    </button>
                    {!activeList.isCompleted && (
                      <button
                        onClick={() => handleCompleteList(activeList.id)}
                        className="btn-primary flex items-center gap-2 text-sm"
                      >
                        <FaCheck />
                        Complete
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--dark-text)' }}>
                      Progress
                    </span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--primary-green)' }}>
                      {activeList.items.length > 0 
                        ? Math.round((activeList.items.filter(item => item.isPurchased).length / activeList.items.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${activeList.items.length > 0 
                          ? (activeList.items.filter(item => item.isPurchased).length / activeList.items.length) * 100 
                          : 0}%`,
                        background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Shopping Items by Category */}
                <div className="space-y-6">
                  {Object.entries(getItemsByCategory(activeList.items)).map(([category, items]) => (
                    items.length > 0 && (
                      <div key={category}>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" 
                            style={{ color: 'var(--primary-green)' }}>
                          <span className="text-xl">{getCategoryIcon(category)}</span>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                          <span className="text-sm font-normal" style={{ color: 'var(--sage-green)' }}>
                            ({items.length})
                          </span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {items.map((item, index) => (
                            <motion.div
                              key={item.id}
                              className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                                item.isPurchased 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-white border-gray-200 hover:border-green-300'
                              }`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleToggleItem(item.id, item.isPurchased)}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                      item.isPurchased 
                                        ? 'bg-green-500 border-green-500' 
                                        : 'border-gray-300 hover:border-green-400'
                                    }`}
                                  >
                                    {item.isPurchased && (
                                      <FaCheck className="text-white text-xs" />
                                    )}
                                  </button>
                                  <div>
                                    <h4 className={`font-semibold text-sm ${
                                      item.isPurchased ? 'line-through text-gray-500' : ''
                                    }`} style={{ color: item.isPurchased ? 'gray' : 'var(--dark-text)' }}>
                                      {item.ingredientName}
                                    </h4>
                                    <p className="text-xs" style={{ color: 'var(--sage-green)' }}>
                                      {item.quantity}
                                    </p>
                                    {item.notes && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {item.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                  <FaEdit className="text-xs text-gray-400" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {activeList.items.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">🛒</div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--dark-text)' }}>
                      Empty shopping list
                    </h3>
                    <p className="text-gray-600 mb-6 text-sm">
                      Add items to start organizing your shopping
                    </p>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="btn-primary"
                    >
                      Add First Item
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl card-shadow p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--dark-text)' }}>
                  No shopping list selected
                </h3>
                <p className="text-gray-600 mb-6">
                  Create a new shopping list or select an existing one
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Shopping List
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Create Shopping List Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
                Create Shopping List
              </h3>
              <form onSubmit={handleCreateList}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                    List Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g., Weekly Groceries"
                    className="form-input w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-semibold transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary text-sm"
                  >
                    Create List
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddItemModal && activeList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--primary-green)' }}>
                Add Item to {activeList.name}
              </h3>
              <form onSubmit={handleAddItem}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="ingredientName"
                    required
                    placeholder="e.g., Tomatoes"
                    className="form-input w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                    Quantity
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    required
                    placeholder="e.g., 2 lbs"
                    className="form-input w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                    Category
                  </label>
                  <select
                    name="category"
                    required
                    className="form-input w-full"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--dark-text)' }}>
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    name="notes"
                    placeholder="e.g., Organic, ripe"
                    className="form-input w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddItemModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-semibold transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary text-sm"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListPage;