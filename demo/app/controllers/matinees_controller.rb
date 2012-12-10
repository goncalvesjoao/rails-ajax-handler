class MatineesController < ApplicationController
  # GET /matinees
  # GET /matinees.json
  def index
    @matinees = Matinee.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @matinees }
    end
  end

  # GET /matinees/1
  # GET /matinees/1.json
  def show
    @matinee = Matinee.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @matinee }
    end
  end

  # GET /matinees/new
  # GET /matinees/new.json
  def new
    @matinee = Matinee.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @matinee }
    end
  end

  # GET /matinees/1/edit
  def edit
    @matinee = Matinee.find(params[:id])
  end

  # POST /matinees
  # POST /matinees.json
  def create
    @matinee = Matinee.new(params[:matinee])

    respond_to do |format|
      if @matinee.save
        format.html { redirect_to @matinee, notice: 'Matinee was successfully created.' }
        format.json { render json: @matinee, status: :created, location: @matinee }
      else
        format.html { render action: "new" }
        format.json { render json: @matinee.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /matinees/1
  # PUT /matinees/1.json
  def update
    @matinee = Matinee.find(params[:id])

    respond_to do |format|
      if @matinee.update_attributes(params[:matinee])
        format.html { redirect_to @matinee, notice: 'Matinee was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @matinee.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /matinees/1
  # DELETE /matinees/1.json
  def destroy
    @matinee = Matinee.find(params[:id])
    @matinee.destroy

    respond_to do |format|
      format.html { redirect_to matinees_url }
      format.json { head :no_content }
    end
  end
end
