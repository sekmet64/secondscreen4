/// <reference path="../connections.ts" />

import express = require('express');
import c = require('./../connections');
import db = require('./../database');

export function index(req: express.Request, res: express.Response) {
    res.render('index', { title: 'Express' });
};

export function downloads(req: express.Request, res: express.Response) {
    res.render('downloads', { title: 'Downloads' });
};

export function remotes(req: express.Request, res: express.Response) {
    var id = req.params.id;

    if (id.length != 5) {
        res.status(404);
        return;
    }


    console.log("remote opened with id: " + id);
    var prod = c.associatedProducts[id];

    if (prod == null) {

        // try offline clients

        var stmt = db.db.prepare("SELECT product FROM Clients WHERE uniqueId= ? LIMIT 1");
        stmt.get(id, function (err, row) {
            console.log(row);

            if (typeof row == 'undefined') {
                res.status(404);
            }
            else {
                prod = c.parseProduct(row["product"]);

                renderRemote(res, prod);
            }
        });
    }
    else {
        renderRemote(res, prod);
    }
};

function renderRemote(res, prod) {
    if (prod == c.Product.M) {
        res.render('mouse-remote');
    }
    else if (prod == c.Product.Y) {
        res.render('youtube-remote');
    }
}


export function youtube(req: express.Request, res: express.Response) {
    res.render('youtube');
}

