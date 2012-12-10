class AddAttachmentCoverToAnimes < ActiveRecord::Migration
  def self.up
    change_table :animes do |t|
      t.has_attached_file :cover
    end
  end

  def self.down
    drop_attached_file :animes, :cover
  end
end
