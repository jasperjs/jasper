declare var jsp: jasper.IJasperStatic;

module jasper {
    (<JasperStatic>window['jsp']).init(new jasper.core.ComponentProvider());
}

