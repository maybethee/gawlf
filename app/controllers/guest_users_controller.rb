class GuestUsersController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create]

  def create
    guest_user = User.create!(
      username: SecureRandom.hex(8),
      email: nil,
      password: 'password',
      password_confirmation: 'password',
      guest: true
    )

    sign_in(guest_user)

    render json: { user: guest_user }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end
end
