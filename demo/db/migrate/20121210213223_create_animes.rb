class CreateAnimes < ActiveRecord::Migration
  def change
    create_table :animes do |t|
      t.string :title
      t.string :serie_type
      t.string :eps
      t.boolean :finished

      t.timestamps
    end
  end
end