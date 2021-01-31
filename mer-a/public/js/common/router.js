'use strict';

class Router {

  constructor(fileAriane, loader) {
    this.fileAriane = fileAriane;
    this.loader = loader;

    this.scene1 = {
      id: 1,
      name: 'scene1',
      elmt : document.querySelector('#scene1')
    };
    this.scene2 = {
      id: 2,
      name: 'scene2',
      elmt: document.querySelector('#scene2')
    };
    this.fondMer = {
      id: 3,
      name: 'fond-mer',
      elmt: document.querySelector('#fond-mer')
    };
    this.fonds = [this.scene1, this.scene2, this.fondMer];
    this.fondActuel = this.scene1;

    this.data = {}
    this.stop = false;

    $(this.scene1.elmt).load(`/mer-a/html/fond/parallax1.html`, () => {
      this.loadParralax(1);
      $(this.scene2.elmt).load(`/mer-a/html/fond/parallax2.html`, () => {
        this.initAnim();
      });
    });
  }

  loadRessources(path, data, change) {
    this.stopAnim();

    $('#content').fadeOut('slow', () => {
      if(path === 'accueil') loader.hide();
      this.deleteCharacter();
      this.changeFond(change);
      $('#content').load(`/mer-a/html/${path}.html`).fadeIn('slow');
    });

    this.data = data;
    this.fileAriane.updateAriane(
      path,
      (deps.get(router.data.department) !== undefined) ? deps.get(router.data.department).nomDepartement : 'Département',
      (getCategorie(router.data.personnage) !== undefined) ? getCategorie(router.data.personnage).nomCategorie : 'Guide',
      'Légende'
    );
  }

  loadParralax(id) {
    if(id === 1 || id === 2) this.parralax = new Parallax((id === 1) ? this.scene1 : this.scene2);
  }

  deleteCharacter() {
    if(document.querySelector('#personnage-s1') !== null) {
      document.querySelector('#personnage-s1').src = "";
    }
    if(document.querySelector('#personnage-s2') !== null) {
      document.querySelector('#personnage-s2').src = "";
    }
  }
  //
  changeFond(idFond) {
    const fond = this.fonds.find(fond => fond.id === idFond);
    if(fond !== undefined && this.fondActuel !== fond) {
      $(fond.elmt).fadeIn('slow');
      $(this.fondActuel.elmt).fadeOut('slow');
      this.fondActuel = fond;
      this.loadParralax(idFond);
    }
  }

  stopAnim() {
    this.stop = !this.stop;
    document.querySelectorAll('.vague').forEach(element => {
      element.style.animationPlaySate = (this.stop) ? 'paused' : 'running';
    });
  }

  loadParralax(id) {
    if(id === 1 || id === 2) this.parralax = new Parallax((id === 1) ? this.scene1.elmt : this.scene2.elmt);
  }

  initAnim() {
    document.querySelectorAll('.vague').forEach((element, index) => {
      element.style.animation = `${element.dataset.animTime}s ${(index % 2 == 0) ? 'waveDown' : 'waveUp'} ease-in-out infinite`;
    });
  }
}
