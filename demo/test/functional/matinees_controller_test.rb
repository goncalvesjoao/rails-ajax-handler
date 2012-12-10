require 'test_helper'

class MatineesControllerTest < ActionController::TestCase
  setup do
    @matinee = matinees(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:matinees)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create matinee" do
    assert_difference('Matinee.count') do
      post :create, matinee: { description: @matinee.description, name: @matinee.name, organizer: @matinee.organizer }
    end

    assert_redirected_to matinee_path(assigns(:matinee))
  end

  test "should show matinee" do
    get :show, id: @matinee
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @matinee
    assert_response :success
  end

  test "should update matinee" do
    put :update, id: @matinee, matinee: { description: @matinee.description, name: @matinee.name, organizer: @matinee.organizer }
    assert_redirected_to matinee_path(assigns(:matinee))
  end

  test "should destroy matinee" do
    assert_difference('Matinee.count', -1) do
      delete :destroy, id: @matinee
    end

    assert_redirected_to matinees_path
  end
end
