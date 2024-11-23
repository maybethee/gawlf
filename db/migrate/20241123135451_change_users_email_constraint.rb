class ChangeUsersEmailConstraint < ActiveRecord::Migration[7.1]
  def change
    # Remove the existing unique index
    remove_index :users, :email if index_exists?(:users, :email)

    # Add a partial unique index to enforce uniqueness only for non-NULL values
    add_index :users, :email, unique: true, where: 'email IS NOT NULL'
  end
end
