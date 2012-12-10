class Matinee < ActiveRecord::Base
  has_and_belongs_to_many :animes

  attr_accessible :description, :name, :organizer, :photo

  has_attached_file :photo, :styles => { :medium => "300x300>", :thumb => "100x100>" }
end
