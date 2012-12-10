class CreateMatineesAnimes < ActiveRecord::Migration
  def change
    create_table :matinees_animes do |t|
      t.integer :matinee_id
      t.integer :anime_id

      t.timestamps
    end
  end
end
