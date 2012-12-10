class CreateMatinees < ActiveRecord::Migration
  def change
    create_table :matinees do |t|
      t.string :name
      t.text :description
      t.string :organizer

      t.timestamps
    end
  end
end
