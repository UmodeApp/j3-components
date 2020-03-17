class J3::ComponentsController < ApplicationController
  before_action :set_episodes, :set_heroes

  def index
    @form_object = { episode_ajax_and_search: 2 }
  end

  def episodes
    @episodes = @episodes.select { |e| e[1].match(Regexp.new(params[:keyword], ignore_case: true)) } if params[:keyword].present?
    render :episodes, layout: false
  end

  def heroes
    @heroes = @heroes.select { |h| h[2].include?(params[:relative].to_i) } if params[:relative].present?
    @heroes = @heroes.select { |e| e[1].match(Regexp.new(params[:keyword], ignore_case: true)) } if params[:keyword].present?
    render :heroes, layout: false
  end

  private

  def set_episodes
    @episodes = [
      [4, 'Episódio IV – Uma Nova Esperança'],
      [5, 'Episódio V - O Império Contra-ataca'],
      [6, 'Episódio VI – O Retorno de Jedi'],
      [1, 'Episódio I – A Ameaça Fantasma'],
      [2, 'Episódio II – Ataque dos Clones'],
      [3, 'Episódio III – A Vingança dos Sith'],
      [7, 'Episódio VII – O Despertar da Força'],
      [8, 'Episódio VIII - Os Últimos Jedi'],
      [9, 'Episódio IX - A Ascensão Skywalker']
    ]
  end

  def set_heroes
    @heroes = [
      [1, 'Anakin Skywalker', [4, 5, 6]],
      [2, 'Obiwan Kenobi', [4, 5, 6, 1, 2, 3]],
      [3, 'Ray', [7, 8, 9]],
      [4, 'Luke Skywalker', [1, 2, 3]]
    ]
  end
end
