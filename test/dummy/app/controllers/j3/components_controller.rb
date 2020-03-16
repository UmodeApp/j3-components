class J3::ComponentsController < ApplicationController
  before_action :set_episodes

  def index
    @form_object = {}
  end

  def episodes
    @episodes = @episodes.reject {|e| !e[1].match(Regexp.new(params[:keyword], ignore_case: true)) } if params[:keyword]
    render :episodes, layout: false
  end

  private 

  def set_episodes
    @episodes = [
      [4, "Episódio IV – Uma Nova Esperança"],
      [5, "Episódio V - O Império Contra-ataca"],
      [6, "Episódio VI – O Retorno de Jedi"],
      [1,"Episódio I – A Ameaça Fantasma"],
      [2,"Episódio II – Ataque dos Clones"],
      [3,"Episódio III – A Vingança dos Sith"],
      [7,"Episódio VII – O Despertar da Força"],
      [8,"Episódio VIII - Os Últimos Jedi"],
      [9,"Episódio IX - A Ascensão Skywalker"]
    ]
  end
end