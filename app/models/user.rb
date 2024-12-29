class User < ApplicationRecord
  before_validation :assign_default_email
  
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         authentication_keys: [:username]

  has_many :game_stats, dependent: :destroy
  has_many :games, through: :game_stats

  validates :email, uniqueness: true, allow_blank: true
  validates :username, uniqueness: true

  # Override Devise's email validation
  def email_required?
    false
  end

  def email_changed?
    false
  end

  def assign_default_email
    self.email = "#{username}@example.com" if email.blank? && username.present?
  end
end
