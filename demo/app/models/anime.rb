class Anime < ActiveRecord::Base
  has_and_belongs_to_many :matinees

  attr_accessible :eps, :finished, :title, :serie_type, :cover

  has_attached_file :cover, :styles => { :medium => "300x300>", :thumb => "100x100>" }

  paginates_per 5
end
