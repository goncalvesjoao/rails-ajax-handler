class CreateAnimesMatinees < ActiveRecord::Migration
  def change
    create_table :animes_matinees do |t|
      t.integer :matinee_id
      t.integer :anime_id

      t.timestamps
    end
  end
end
